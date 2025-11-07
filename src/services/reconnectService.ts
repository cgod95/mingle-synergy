import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/firebase";

/**
 * Checks if a reconnect is allowed between two users.
 * Reconnects are only allowed if:
 * - A match exists
 * - The match is expired
 * - The match has not already been reconnected
 */
export const canReconnect = async (currentUid: string, targetUid: string): Promise<boolean> => {
  const matchDocId = [currentUid, targetUid].sort().join("_");
  const matchRef = doc(firestore, "matches", matchDocId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) return false;

  const data = matchSnap.data();
  return data.expired === true && data.reconnected !== true;
};

/**
 * Handles sending a reconnect request between two users.
 * This will fail if the match is not expired or already reconnected.
 */
export const handleReconnectRequest = async (currentUid: string, targetUid: string): Promise<void> => {
  const eligible = await canReconnect(currentUid, targetUid);
  if (!eligible) {
    throw new Error("Reconnect not allowed or already handled.");
  }

  const matchDocId = [currentUid, targetUid].sort().join("_");
  const matchRef = doc(firestore, "matches", matchDocId);

  await updateDoc(matchRef, {
    reconnectRequestedBy: currentUid,
    reconnectRequestedAt: serverTimestamp(),
    expired: false // Clear expiration once reconnected
  });
};

/**
 * Accepts a reconnect request between two users.
 * This confirms the mutual intent and reactivates the match.
 */
export const acceptReconnectRequest = async (currentUid: string, targetUid: string): Promise<void> => {
  const matchDocId = [currentUid, targetUid].sort().join("_");
  const matchRef = doc(firestore, "matches", matchDocId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) throw new Error("Match not found.");

  const data = matchSnap.data();
  if (data.reconnectRequestedBy !== targetUid) {
    throw new Error("No reconnect request from this user.");
  }

  await updateDoc(matchRef, {
    reconnected: true,
    expired: false,
    reconnectAcceptedAt: serverTimestamp()
  });
};

/**
 * Gets all pending reconnect requests for a user.
 * Returns an array of user IDs who have requested to reconnect.
 */
export const getPendingReconnectRequests = async (currentUid: string): Promise<string[]> => {
  // This would need to query matches where reconnectRequestedBy is set
  // For now, we'll use the existing user service approach
  // In a full implementation, you might want to query the matches collection directly
  
  // Import userService dynamically to avoid circular dependencies
  const userService = (await import('./firebase/userService')).default;
  return userService.getReconnectRequests(currentUid);
}; 