import { firestore } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "@/types/services";

/**
 * Fetches reconnect requests for a user using subcollection approach
 * Returns array of UserProfile objects for users who want to reconnect
 */
export const fetchReconnectRequests = async (currentUserId: string): Promise<UserProfile[]> => {
  try {
    // Return empty array if firestore is not available
    if (!firestore) {
      return [];
    }
    
    const requestsRef = collection(firestore, "users", currentUserId, "reconnectRequests");
    const snapshot = await getDocs(requestsRef);
    const users: UserProfile[] = [];

    for (const docSnap of snapshot.docs) {
      const userDoc = await getDoc(doc(firestore, "users", docSnap.id));
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
    console.error("Error fetching reconnect requests:", error);
    throw new Error("Failed to fetch reconnect requests");
  }
};

/**
 * Fetches accepted reconnects for a user with timestamps
 * Returns array of objects with user profile and reconnection timestamp
 */
export const fetchAcceptedReconnects = async (currentUserId: string): Promise<Array<{user: UserProfile, reconnectedAt: Date}>> => {
  try {
    // Return empty array if firestore is not available
    if (!firestore) {
      return [];
    }
    
    const acceptedRef = collection(firestore, "users", currentUserId, "acceptedReconnects");
    const snapshot = await getDocs(acceptedRef);
    const reconnectData: Array<{user: UserProfile, reconnectedAt: Date}> = [];

    for (const docSnap of snapshot.docs) {
      const userDoc = await getDoc(doc(firestore, "users", docSnap.id));
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
    console.error("Error fetching accepted reconnects:", error);
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
    // Return early if firestore is not available
    if (!firestore) {
      return;
    }
    
    const requestRef = doc(firestore, "users", currentUserId, "reconnectRequests", otherUserId);
    const reverseRef = doc(firestore, "users", otherUserId, "reconnectRequests", currentUserId);

    // Delete both sides of the request
    await deleteDoc(requestRef);
    await deleteDoc(reverseRef);

    // Create mutual "acceptedReconnects" for analytics and UI state
    const acceptedRef = doc(firestore, "users", currentUserId, "acceptedReconnects", otherUserId);
    const reverseAcceptedRef = doc(firestore, "users", otherUserId, "acceptedReconnects", currentUserId);

    const timestamp = serverTimestamp();
    await setDoc(acceptedRef, { timestamp });
    await setDoc(reverseAcceptedRef, { timestamp });

    // Optionally create a new match between the users
    const matchService = (await import('./firebase/matchService')).default;
    await matchService.createMatch(currentUserId, otherUserId, 'reconnect-venue', 'Reconnection');
  } catch (error) {
    console.error("Error accepting reconnect request:", error);
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
    // Return early if firestore is not available
    if (!firestore) {
      return;
    }
    
    const requestRef = doc(firestore, "users", toUserId, "reconnectRequests", fromUserId);
    const reverseRef = doc(firestore, "users", fromUserId, "reconnectRequests", toUserId);

    const timestamp = serverTimestamp();
    await setDoc(requestRef, { timestamp });
    await setDoc(reverseRef, { timestamp });
  } catch (error) {
    console.error("Error sending reconnect request:", error);
    throw new Error("Failed to send reconnect request");
  }
};

/**
 * Checks if a user has pending reconnect requests
 * Returns true if there are any requests in the subcollection
 */
export const hasReconnectRequests = async (userId: string): Promise<boolean> => {
  try {
    // Return false if firestore is not available
    if (!firestore) {
      return false;
    }
    
    const requestsRef = collection(firestore, "users", userId, "reconnectRequests");
    const snapshot = await getDocs(requestsRef);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking reconnect requests:", error);
    return false;
  }
}; 