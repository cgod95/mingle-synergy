import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/firebase/config';

export interface UnreadCounts {
  [matchId: string]: number;
}

export const getUnreadMessageCounts = async (userId: string): Promise<UnreadCounts> => {
  try {
    if (!firestore) {
      return {};
    }

    // Get all matches for the user (where user is either userId1 or userId2)
    const matchesRef = collection(firestore, 'matches');
    
    // Query for matches where user is userId1
    const q1 = query(matchesRef, where("userId1", "==", userId));
    const snapshot1 = await getDocs(q1);
    
    // Query for matches where user is userId2
    const q2 = query(matchesRef, where("userId2", "==", userId));
    const snapshot2 = await getDocs(q2);
    
    const matchIds = [...snapshot1.docs, ...snapshot2.docs].map(doc => doc.id);
    
    if (matchIds.length === 0) {
      return {};
    }

    // Firestore 'in' operator has a limit of 10, so we need to batch if needed
    const unreadCounts: UnreadCounts = {};
    
    // Initialize all match counts to 0
    matchIds.forEach(matchId => {
      unreadCounts[matchId] = 0;
    });

    // Process matches in batches of 10 (Firestore 'in' limit)
    for (let i = 0; i < matchIds.length; i += 10) {
      const batch = matchIds.slice(i, i + 10);
      
      // Get messages for this batch of matches
      const messagesQuery = query(
        collection(firestore, 'messages'),
        where('matchId', 'in', batch)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      
      // Count unread messages (messages not read by current user)
      messagesSnapshot.docs.forEach(doc => {
        const message = doc.data();
        const readBy = message.readBy || [];
        // Message is unread if readBy doesn't include userId
        if (!readBy.includes(userId)) {
          const matchId = message.matchId;
          if (matchId && matchIds.includes(matchId)) {
            unreadCounts[matchId] = (unreadCounts[matchId] || 0) + 1;
          }
        }
      });
    }

    return unreadCounts;
  } catch (error) {
    console.error('Error fetching unread message counts:', error);
    return {};
  }
};

export const subscribeToUnreadCounts = (
  userId: string, 
  callback: (counts: UnreadCounts) => void
) => {
  if (!userId || !firestore) return () => {};

  // Subscribe to matches changes - use userId1 and userId2 queries
  const matchesRef = collection(firestore, 'matches');
  
  // Query for matches where user is userId1
  const q1 = query(matchesRef, where("userId1", "==", userId));
  
  // Query for matches where user is userId2  
  const q2 = query(matchesRef, where("userId2", "==", userId));

  let allMatchIds: Set<string> = new Set();

  const updateCounts = async () => {
    if (allMatchIds.size === 0) {
      callback({});
      return;
    }

    // Get unread counts for current matches
    const counts = await getUnreadMessageCounts(userId);
    callback(counts);
  };

  const unsubscribe1 = onSnapshot(q1, async (snapshot1) => {
    const ids1 = snapshot1.docs.map(doc => doc.id);
    ids1.forEach(id => allMatchIds.add(id));
    await updateCounts();
  });

  const unsubscribe2 = onSnapshot(q2, async (snapshot2) => {
    const ids2 = snapshot2.docs.map(doc => doc.id);
    ids2.forEach(id => allMatchIds.add(id));
    await updateCounts();
  });

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};

export const getTotalUnreadCount = (counts: UnreadCounts): number => {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}; 