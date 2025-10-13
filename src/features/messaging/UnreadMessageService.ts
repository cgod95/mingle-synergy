import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import logger from '@/utils/Logger';

export interface UnreadCounts {
  [matchId: string]: number;
}

export const getUnreadMessageCounts = async (userId: string): Promise<UnreadCounts> => {
  try {
    // Get all matches for the user
    const matchesQuery = query(
      collection(db, 'matches'),
      where('participantIds', 'array-contains', userId)
    );
    
    const matchesSnapshot = await getDocs(matchesQuery);
    const matchIds = matchesSnapshot.docs.map(doc => doc.id);
    
    if (matchIds.length === 0) {
      return {};
    }

    // Get unread messages for all matches
    const unreadQuery = query(
      collection(db, 'messages'),
      where('matchId', 'in', matchIds),
      where('readBy', 'array-contains', userId)
    );

    const messagesSnapshot = await getDocs(unreadQuery);
    const unreadCounts: UnreadCounts = {};

    // Initialize all match counts to 0
    matchIds.forEach(matchId => {
      unreadCounts[matchId] = 0;
    });

    // Count unread messages (messages not read by current user)
    messagesSnapshot.docs.forEach(doc => {
      const message = doc.data();
      if (!message.readBy?.includes(userId)) {
        unreadCounts[message.matchId] = (unreadCounts[message.matchId] || 0) + 1;
      }
    });

    return unreadCounts;
  } catch (error) {
    logger.error('Error fetching unread message counts:', error);
    return {};
  }
};

export const subscribeToUnreadCounts = (
  userId: string, 
  callback: (counts: UnreadCounts) => void
) => {
  if (!userId) return () => {};

  // Subscribe to matches changes
  const matchesQuery = query(
    collection(db, 'matches'),
    where('participantIds', 'array-contains', userId)
  );

  const unsubscribeMatches = onSnapshot(matchesQuery, async (matchesSnapshot) => {
    const matchIds = matchesSnapshot.docs.map(doc => doc.id);
    
    if (matchIds.length === 0) {
      callback({});
      return;
    }

    // Get unread counts for current matches
    const counts = await getUnreadMessageCounts(userId);
    callback(counts);
  });

  return unsubscribeMatches;
};

export const getTotalUnreadCount = (counts: UnreadCounts): number => {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}; 