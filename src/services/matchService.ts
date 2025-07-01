import { firestore } from "@/firebase/config";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

/**
 * Checks if both users have confirmed meeting
 * @param matchId - The ID of the match
 * @returns true if both users confirmed, false otherwise
 */
export async function hasBothConfirmed(matchId: string): Promise<boolean> {
  const matchRef = doc(firestore, "matches", matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) return false;

  const data = matchSnap.data();
  const confirmations = data.confirmations || {};
  const confirmedUsers = Object.values(confirmations).filter((v) => v === true);

  return confirmedUsers.length === 2;
}

/**
 * Gets the confirmation status for a specific user in a match
 * @param matchId - The ID of the match
 * @param userId - The ID of the user
 * @returns true if user confirmed, false otherwise
 */
export async function getUserConfirmationStatus(matchId: string, userId: string): Promise<boolean> {
  const matchRef = doc(firestore, "matches", matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) return false;

  const data = matchSnap.data();
  const confirmations = data.confirmations || {};
  
  return confirmations[userId] === true;
}

/**
 * Confirms that a user has met their match
 * @param matchId - The ID of the match
 * @param userId - The ID of the user confirming
 * @returns Promise that resolves when confirmation is saved
 */
export async function confirmUserMet(matchId: string, userId: string): Promise<void> {
  const matchRef = doc(firestore, "matches", matchId);
  
  await updateDoc(matchRef, {
    [`confirmations.${userId}`]: true,
    [`confirmedAt.${userId}`]: new Date().toISOString()
  });
}

/**
 * Gets the number of users who have confirmed in a match
 * @param matchId - The ID of the match
 * @returns number of confirmed users (0, 1, or 2)
 */
export async function getConfirmationCount(matchId: string): Promise<number> {
  const matchRef = doc(firestore, "matches", matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) return 0;

  const data = matchSnap.data();
  const confirmations = data.confirmations || {};
  const confirmedUsers = Object.values(confirmations).filter((v) => v === true);

  return confirmedUsers.length;
} 