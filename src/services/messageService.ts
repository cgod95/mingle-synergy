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
  writeBatch
} from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { UserProfile } from "@/types/services";
import { FirestoreMatch } from "@/types/match";
import { FEATURE_FLAGS } from "@/lib/flags";
import { MATCH_EXPIRY_MS } from "@/lib/matchesCompat";
import { logError } from '@/utils/errorHandler';
import config from '@/config';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  readBy?: string[]; // Array of user IDs who have read this message
}

/**
 * Send a message with validation for the message limit per user per match
 * Uses feature flag LIMIT_MESSAGES_PER_USER (default: 3)
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
  // Check if user is premium (premium users get unlimited messages)
  // Note: Premium is NOT available in beta, but logic is here for future
  let isPremium = false;
  try {
    const { subscriptionService } = await import("@/services");
    if (subscriptionService && typeof subscriptionService.getUserSubscription === 'function') {
      const subscription = subscriptionService.getUserSubscription(senderId);
      isPremium = subscription?.tierId === 'premium' || subscription?.tierId === 'pro';
    }
  } catch {
    // Ignore errors - assume not premium
  }
  
  // Premium users bypass message limits (but match still expires)
  if (isPremium) {
    // Premium users can send unlimited messages
    // Continue to send message without limit check
  } else {
    // In demo mode, skip message limit checks
    if (!config.DEMO_MODE) {
      // Check if firestore is available before using collection
      if (!firestore) {
        throw new Error('Firestore not available');
      }
      
      const messagesRef = collection(firestore, "messages");
      const messageLimit = typeof FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER === 'number' 
        ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER 
        : 10;

      const q = query(
        messagesRef,
        where("matchId", "==", matchId),
        where("senderId", "==", senderId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.docs.length >= messageLimit) {
        throw new Error(`Message limit reached (${messageLimit} messages)`);
      }
    }
  }

  // In demo mode, use localStorage-based chatStore instead of Firestore
  if (config.DEMO_MODE) {
    const { appendMessage } = await import('@/lib/chatStore');
    appendMessage(matchId, {
      sender: 'me',
      ts: Date.now(),
      text: message,
    });
    return;
  }

  // Check if firestore is available before using collection
  if (!firestore) {
    throw new Error('Firestore not available');
  }
  
  await addDoc(collection(firestore, "messages"), {
    matchId,
    senderId,
    text: message,
    createdAt: serverTimestamp(),
  });
};

/**
 * Check if a user can send a message (enforce message limit per user per match)
 * Uses feature flag LIMIT_MESSAGES_PER_USER (default: 3)
 */
export const canSendMessage = async (matchId: string, senderId: string): Promise<boolean> => {
  // Check if user is premium (premium users get unlimited messages)
  // Note: Premium is NOT available in beta, but logic is here for future
  let isPremium = false;
  try {
    const { subscriptionService } = await import("@/services");
    if (subscriptionService && typeof subscriptionService.getUserSubscription === 'function') {
      const subscription = subscriptionService.getUserSubscription(senderId);
      isPremium = subscription?.tierId === 'premium' || subscription?.tierId === 'pro';
    }
  } catch {
    // Ignore errors - assume not premium
  }
  
  // Premium users bypass message limits
  if (isPremium) {
    return true;
  }
  
  // In demo mode, always allow sending messages (unlimited)
  if (config.DEMO_MODE) {
    return true;
  }

  try {
    // Check if firestore is available
    if (!firestore) {
      return false;
    }
    
    const messageLimit = typeof FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER === 'number' 
      ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER 
      : 10;
    const q = query(
      collection(firestore, "messages"),
      where("matchId", "==", matchId),
      where("senderId", "==", senderId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size < messageLimit;
  } catch (error) {
    logError(error as Error, { source: 'messageService', action: 'canSendMessage', matchId, senderId });
    return false;
  }
};

/**
 * Send a message, but prevent sending to expired matches (older than 3 hours)
 */
export const sendMessage = async (matchId: string, senderId: string, text: string): Promise<void> => {
  // Check if firestore is available
  if (!firestore) {
    throw new Error('Firestore not available');
  }
  
  const matchDoc = await getDoc(doc(firestore, "matches", matchId));
  if (!matchDoc.exists()) throw new Error("Match does not exist");

  const matchData = matchDoc.data();
  const createdAt = typeof matchData.timestamp === 'number' ? matchData.timestamp : 0;
  const now = Date.now();

  if (now - createdAt > MATCH_EXPIRY_MS) {
    throw new Error("Match has expired. Please reconnect by checking in again.");
  }

  // Check message limit
  const canSend = await canSendMessage(matchId, senderId);
  if (!canSend) {
    throw new Error("Message limit reached");
  }

  await addDoc(collection(firestore, "messages"), {
        matchId,
        senderId,
        text,
        createdAt: serverTimestamp(),
      });
      
      // Track message sent event per spec section 9
      try {
        const { trackMessageSent } = await import('./specAnalytics');
        trackMessageSent(matchId, senderId, text.length);
      } catch (error) {
        logError(error as Error, { source: 'messageService', action: 'trackMessageSent', matchId, senderId });
      }
};

/**
 * Get message count for a user in a specific match
 */
export const getMessageCount = async (matchId: string, senderId: string): Promise<number> => {
  try {
    // Check if firestore is available
    if (!firestore) {
      return 0;
    }
    
    const q = query(
      collection(firestore, "messages"),
      where("matchId", "==", matchId),
      where("senderId", "==", senderId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    logError(error as Error, { source: 'messageService', action: 'getMessageCount', matchId, senderId });
    return 0;
  }
};

/**
 * Get remaining messages for a user in a specific match
 */
export const getRemainingMessages = async (matchId: string, senderId: string): Promise<number> => {
  const messageLimit = typeof FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER === 'number' 
    ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER 
    : 10;
  const count = await getMessageCount(matchId, senderId);
  return Math.max(0, messageLimit - count);
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
  // Check if user is premium (premium users get unlimited messages)
  // Note: Premium is NOT available in beta, but logic is here for future
  let isPremium = false;
  try {
    const { subscriptionService } = require("@/services");
    if (subscriptionService && typeof subscriptionService.getUserSubscription === 'function') {
      const subscription = subscriptionService.getUserSubscription(senderId);
      isPremium = subscription?.tierId === 'premium' || subscription?.tierId === 'pro';
    }
  } catch {
    // Ignore errors - assume not premium
  }
  
  // Premium users bypass message limits (hide UI)
  if (isPremium) {
    // Return a no-op unsubscribe function
    callback(true, 999); // Show unlimited for premium
    return () => {}; // No-op unsubscribe
  }
  
  // Check if firestore is available
  if (!firestore) {
    callback(false, 0);
    return () => {}; // Return no-op unsubscribe
  }
  
  const q = query(
    collection(firestore, "messages"),
    where("matchId", "==", matchId),
    where("senderId", "==", senderId)
  );

  const messageLimit = typeof FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER === 'number' 
    ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER 
    : 10;
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messageCount = snapshot.docs.length;
    const canSend = messageCount < messageLimit;
    const remaining = Math.max(0, messageLimit - messageCount);
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
    // Check if firestore is available
    if (!firestore) {
      return [];
    }
    
    // Get all matches for the user (where user is either userId1 or userId2)
    const matchesRef = collection(firestore, "matches");
    
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

    // Filter out expired matches using single source of truth
    const now = Date.now();
    const activeMatches = allMatches.filter(match => {
      const matchTimestamp = match.timestamp || 0;
      return now - matchTimestamp < MATCH_EXPIRY_MS;
    });

    const chatPreviews: ChatPreview[] = [];

    for (const match of activeMatches) {
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      
      if (!otherUserId) continue;

      // Get the other user's profile
      const userDoc = await getDoc(doc(firestore, "users", otherUserId));
      if (!userDoc.exists()) continue;

      const userData = userDoc.data() as UserProfile;
      
      // Get the last message from the messages collection
      const messagesRef = collection(firestore, "messages");
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
    logError(error as Error, { source: 'messageService', action: 'getUserChats', userId });
    throw new Error("Failed to fetch chats");
  }
};

/**
 * Get all messages for a match (one-time fetch)
 */
export const getMatchMessages = async (matchId: string): Promise<Message[]> => {
  // Check if firestore is available
  if (!firestore) {
    return [];
  }
  
  try {
    const messagesRef = collection(firestore, "messages");
    const q = query(
      messagesRef,
      where("matchId", "==", matchId),
      orderBy("createdAt", "asc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      senderId: doc.data().senderId,
      text: doc.data().text,
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
      readBy: doc.data().readBy || [],
    }));
  } catch (error) {
    logError(error as Error, { source: 'messageService', action: 'getMatchMessages', matchId });
    return [];
  }
};

/**
 * Subscribe to real-time message updates for a match
 * Returns an unsubscribe function
 */
export const subscribeToMessages = (
  matchId: string, 
  callback: (messages: Message[]) => void,
  onError?: (error: Error) => void
) => {
  // Check if firestore is available
  if (!firestore) {
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }
  
  const messagesRef = collection(firestore, "messages");
  const q = query(
    messagesRef,
    where("matchId", "==", matchId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const messages: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        senderId: doc.data().senderId,
        text: doc.data().text,
        createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
        readBy: doc.data().readBy || [],
      }));
      callback(messages);
    },
    (error) => {
      // Log the error but don't wipe existing messages
      logError(error as Error, { source: 'messageService', action: 'subscribeToMessages', matchId });
      if (onError) {
        onError(error as Error);
      }
    }
  );
};

/**
 * Get the last message for a specific match (for Matches page preview)
 * Returns null if no messages exist
 */
export interface LastMessageInfo {
  text: string;
  senderId: string;
  createdAt: Date;
}

export const getLastMessageForMatch = async (matchId: string): Promise<LastMessageInfo | null> => {
  // In demo mode, return null (use localStorage instead)
  if (config.DEMO_MODE) {
    return null;
  }
  
  // Check if firestore is available
  if (!firestore) {
    return null;
  }
  
  try {
    const messagesRef = collection(firestore, "messages");
    const q = query(
      messagesRef,
      where("matchId", "==", matchId),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      text: data.text || '',
      senderId: data.senderId || '',
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  } catch (error) {
    logError(error as Error, { source: 'messageService', action: 'getLastMessageForMatch', matchId });
    return null;
  }
};

/**
 * Mark messages as read for a specific user in a match
 */
export const markMessagesAsRead = async (matchId: string, userId: string): Promise<void> => {
  try {
    // Check if firestore is available
    if (!firestore) {
      return;
    }
    
    const messagesRef = collection(firestore, "messages");
    const q = query(
      messagesRef,
      where("matchId", "==", matchId),
      where("senderId", "!=", userId) // Only mark messages from other users as read
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(firestore);
    
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
    logError(error as Error, { source: 'messageService', action: 'markMessagesAsRead', matchId, userId });
  }
}; 