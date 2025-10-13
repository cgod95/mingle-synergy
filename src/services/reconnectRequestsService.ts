import { db } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "@/types/services";
import logger from '@/utils/Logger';

/**
 * Fetches reconnect requests for a user using subcollection approach
 * Returns array of UserProfile objects for users who want to reconnect
 */
export const fetchReconnectRequests = async (currentUserId: string): Promise<UserProfile[]> => {
  try {
    const requestsRef = collection(db, "users", currentUserId, "reconnectRequests");
    const snapshot = await getDocs(requestsRef);
    const users: UserProfile[] = [];

    for (const docSnap of snapshot.docs) {
      const userDoc = await getDoc(doc(db, "users", docSnap.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        users.push({ 
          ...(userData as UserProfile), 
          uid: docSnap.id,
          id: docSnap.id 
        });
      }
    }

    return users;
  } catch (error) {
    logger.error("Error fetching reconnect requests:", error);
    throw new Error("Failed to fetch reconnect requests");
  }
};

/**
 * Fetches accepted reconnects for a user with timestamps
 * Returns array of objects with user profile and reconnection timestamp
 */
export const fetchAcceptedReconnects = async (currentUserId: string): Promise<Array<{user: UserProfile, reconnectedAt: Date}>> => {
  try {
    const acceptedRef = collection(db, "users", currentUserId, "acceptedReconnects");
    const snapshot = await getDocs(acceptedRef);
    const reconnectData: Array<{user: UserProfile, reconnectedAt: Date}> = [];

    for (const docSnap of snapshot.docs) {
      const userDoc = await getDoc(doc(db, "users", docSnap.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const reconnectDoc = docSnap.data();
        
        reconnectData.push({
          user: { 
            ...(userData as UserProfile), 
            uid: docSnap.id,
            id: docSnap.id 
          },
          reconnectedAt: reconnectDoc.timestamp?.toDate() || new Date()
        });
      }
    }

    // Sort by most recent first
    return reconnectData.sort((a, b) => b.reconnectedAt.getTime() - a.reconnectedAt.getTime());
  } catch (error) {
    logger.error("Error fetching accepted reconnects:", error);
    throw new Error("Failed to fetch accepted reconnects");
  }
};

/**
 * Accepts a reconnect request between two users
 * Deletes the request documents and creates accepted reconnects
 */
export const acceptReconnectRequest = async (
  currentUserId: string,
  otherUserId: string
): Promise<void> => {
  try {
    const requestRef = doc(db, "users", currentUserId, "reconnectRequests", otherUserId);
    const reverseRef = doc(db, "users", otherUserId, "reconnectRequests", currentUserId);

    // Delete both sides of the request
    await deleteDoc(requestRef);
    await deleteDoc(reverseRef);

    // Create mutual "acceptedReconnects" for analytics and UI state
    const acceptedRef = doc(db, "users", currentUserId, "acceptedReconnects", otherUserId);
    const reverseAcceptedRef = doc(db, "users", otherUserId, "acceptedReconnects", currentUserId);

    const timestamp = serverTimestamp();
    await setDoc(acceptedRef, { timestamp });
    await setDoc(reverseAcceptedRef, { timestamp });

    // Optionally create a new match between the users
    const matchService = (await import('./firebase/matchService')).default;
    await matchService.createMatch(currentUserId, otherUserId, 'reconnect-venue', 'Reconnection');
  } catch (error) {
    logger.error("Error accepting reconnect request:", error);
    throw new Error("Failed to accept reconnect request");
  }
};

/**
 * Sends a reconnect request from one user to another
 * Creates documents in both users' reconnectRequests subcollections
 */
export const sendReconnectRequest = async (
  fromUserId: string,
  toUserId: string
): Promise<void> => {
  try {
    const requestRef = doc(db, "users", toUserId, "reconnectRequests", fromUserId);
    const reverseRef = doc(db, "users", fromUserId, "reconnectRequests", toUserId);

    const timestamp = serverTimestamp();
    await setDoc(requestRef, { timestamp });
    await setDoc(reverseRef, { timestamp });
  } catch (error) {
    logger.error("Error sending reconnect request:", error);
    throw new Error("Failed to send reconnect request");
  }
};

/**
 * Checks if a user has pending reconnect requests
 * Returns true if there are any requests in the subcollection
 */
export const hasReconnectRequests = async (userId: string): Promise<boolean> => {
  try {
    const requestsRef = collection(db, "users", userId, "reconnectRequests");
    const snapshot = await getDocs(requestsRef);
    return !snapshot.empty;
  } catch (error) {
    logger.error("Error checking reconnect requests:", error);
    return false;
  }
}; 