import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  onSnapshot,
  getDoc,
  doc,
  orderBy,
  limit,
  writeBatch,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { UserProfile } from "@/types/services";
import { FirestoreMatch } from "@/types/match";
import logger from '@/utils/Logger';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  content: string; // Add the missing content property
  timestamp: number;
  readBy?: string[];
  type?: 'text' | 'image' | 'location';
  metadata?: Record<string, unknown>;
}

/**
 * Send a message with validation for the 3-message limit per user per match
 */
export const sendMessageWithLimit = async ({
  matchId,
  senderId,
  message,
}: {
  matchId: string;
  senderId: string;
  message: string;
}) => {
  const messagesRef = collection(db, "messages");

  const q = query(
    messagesRef,
    where("matchId", "==", matchId),
    where("senderId", "==", senderId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.docs.length >= 3) {
    throw new Error("Message limit reached");
  }

  await addDoc(messagesRef, {
    matchId,
    senderId,
    text: message,
    createdAt: serverTimestamp(),
  });
};

/**
 * Check if a user can send a message (enforce 3-message limit per user per match)
 */
export const canSendMessage = async (matchId: string, senderId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, "messages"),
      where("matchId", "==", matchId),
      where("senderId", "==", senderId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size < 3;
  } catch (error) {
    logger.error('Error checking message limit:', error);
    return false;
  }
};

/**
 * Send a message, but prevent sending to expired matches (older than 3 hours)
 */
export const sendMessage = async (matchId: string, senderId: string, text: string): Promise<void> => {
  const matchDoc = await getDoc(doc(db, "matches", matchId));
  if (!matchDoc.exists()) throw new Error("Match does not exist");

  const matchData = matchDoc.data();
  const createdAt = typeof matchData.timestamp === 'number' ? matchData.timestamp : 0;
  const now = Date.now();
  const threeHours = 3 * 60 * 60 * 1000;

  if (now - createdAt > threeHours) {
    throw new Error("Match has expired. Please reconnect by checking in again.");
  }

  // Check message limit
  const canSend = await canSendMessage(matchId, senderId);
  if (!canSend) {
    throw new Error("Message limit reached");
  }

  await addDoc(collection(db, "messages"), {
    matchId,
    senderId,
    text,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  });
};

export const markMessageAsRead = async (
  matchId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, "messages", messageId);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
      logger.warn(`Message ${messageId} not found for match ${matchId}`);
      return;
    }

    const data = messageSnap.data();
    const readBy = Array.isArray(data.readBy) ? data.readBy : [];

    if (readBy.includes(userId)) {
      return;
    }

    await updateDoc(messageRef, {
      readBy: [...readBy, userId],
    });
  } catch (error) {
    logger.error('Error marking message as read:', error);
  }
};

/**
 * Get message count for a user in a specific match
 */
export const getMessageCount = async (matchId: string, senderId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, "messages"),
      where("matchId", "==", matchId),
      where("senderId", "==", senderId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    logger.error('Error getting message count:', error);
    return 0;
  }
};

/**
 * Get remaining messages for a user in a specific match
 */
export const getRemainingMessages = async (matchId: string, senderId: string): Promise<number> => {
  const count = await getMessageCount(matchId, senderId);
  return Math.max(0, 3 - count);
};

/**
 * Real-time message limit checker using Firestore listener
 * Returns a function to unsubscribe from the listener
 */
export const subscribeToMessageLimit = (
  matchId: string,
  senderId: string,
  callback: (canSend: boolean, remaining: number) => void
) => {
  const q = query(
    collection(db, "messages"),
    where("matchId", "==", matchId),
    where("senderId", "==", senderId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messageCount = snapshot.docs.length;
    const canSend = messageCount < 3;
    const remaining = Math.max(0, 3 - messageCount);
    callback(canSend, remaining);
  });

  return unsubscribe;
};

export interface ChatPreview {
  chatId: string;
  otherUser: UserProfile;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  matchId: string;
}

/**
 * Fetches chat previews for a user
 * Returns array of chat previews with last message and user info
 */
export const getUserChats = async (userId: string): Promise<ChatPreview[]> => {
  try {
    // Get all matches for the user (where user is either userId1 or userId2)
    const matchesRef = collection(db, "matches");
    
    // Query for matches where user is userId1
    const q1 = query(
      matchesRef,
      where("userId1", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    // Query for matches where user is userId2
    const q2 = query(
      matchesRef,
      where("userId2", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    const allMatches: FirestoreMatch[] = [
      ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreMatch)),
      ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreMatch))
    ];

    // Filter out expired matches (older than 3 hours)
    const now = Date.now();
    const activeMatches = allMatches.filter(match => {
      const matchTimestamp = match.timestamp || 0;
      return now - matchTimestamp < 3 * 60 * 60 * 1000; // 3 hours
    });

    const chatPreviews: ChatPreview[] = [];

    for (const match of activeMatches) {
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      
      if (!otherUserId) continue;

      // Get the other user's profile
      const userDoc = await getDoc(doc(db, "users", otherUserId));
      if (!userDoc.exists()) continue;

      const userData = userDoc.data() as UserProfile;
      
      // Get the last message from the messages collection
      const messagesRef = collection(db, "messages");
      const messagesQuery = query(
        messagesRef,
        where("matchId", "==", match.id),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      let lastMessage = "Start a conversation!";
      let lastMessageTime = new Date(match.timestamp || Date.now());
      
      if (!messagesSnapshot.empty) {
        const lastMessageDoc = messagesSnapshot.docs[0];
        const lastMessageData = lastMessageDoc.data();
        lastMessage = lastMessageData.text || "Start a conversation!";
        lastMessageTime = lastMessageData.createdAt?.toDate?.() ?? new Date(match.timestamp || Date.now());
      }

      // Get unread count (simplified - you might want to track this in the match document)
      const unreadCount = 0; // TODO: Implement unread message tracking

      chatPreviews.push({
        chatId: match.id,
        matchId: match.id,
        otherUser: {
          ...userData,
          uid: otherUserId,
          id: otherUserId
        },
        lastMessage,
        lastMessageTime,
        unreadCount
      });
    }

    // Sort by last message time (most recent first)
    return chatPreviews.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  } catch (error) {
    logger.error("Error fetching user chats:", error);
    throw new Error("Failed to fetch chats");
  }
};

/**
 * Subscribe to real-time message updates for a match
 * Returns an unsubscribe function
 */
export const subscribeToMessages = (
  matchId: string, 
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("matchId", "==", matchId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      senderId: doc.data().senderId,
      text: doc.data().text,
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
      readBy: doc.data().readBy || [],
    }));
    callback(messages);
  });
};

/**
 * Mark messages as read for a specific user in a match
 */
export const markMessagesAsRead = async (matchId: string, userId: string): Promise<void> => {
  try {
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("matchId", "==", matchId),
      where("senderId", "!=", userId) // Only mark messages from other users as read
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const readBy = data.readBy || [];
      
      if (!readBy.includes(userId)) {
        batch.update(doc.ref, {
          readBy: [...readBy, userId]
        });
      }
    });
    
    await batch.commit();
  } catch (error) {
    logger.error('Error marking messages as read:', error);
  }
}; 