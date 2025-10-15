import { db } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion, collection, setDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";

/**
 * Checks if both users have confirmed meeting
 * @param matchId - The ID of the match
 * @returns true if both users confirmed, false otherwise
 */
export async function hasBothConfirmed(matchId: string): Promise<boolean> {
  const matchRef = doc(db, "matches", matchId);
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
  const matchRef = doc(db, "matches", matchId);
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
  const matchRef = doc(db, "matches", matchId);
  
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
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) return 0;

  const data = matchSnap.data();
  const confirmations = data.confirmations || {};
  const confirmedUsers = Object.values(confirmations).filter((v) => v === true);

  return confirmedUsers.length;
} 

/**
 * Create a match if both users liked each other and are checked into the same venue.
 * Creates a doc in /matches with { participants: [userAId, userBId], venueId, createdAt, expiresAt }
 */
export async function createMatchIfMutual(userAId: string, userBId: string, venueId: string): Promise<string | null> {
  // Validate venue and likes
  const likesARef = doc(db, "likes", userAId);
  const likesBRef = doc(db, "likes", userBId);
  const [likesASnap, likesBSnap] = await Promise.all([getDoc(likesARef), getDoc(likesBRef)]);

  const aLikes = likesASnap.exists() ? (likesASnap.data().likes || []) : [];
  const bLikes = likesBSnap.exists() ? (likesBSnap.data().likes || []) : [];
  const isMutual = aLikes.includes(userBId) && bLikes.includes(userAId);
  if (!isMutual) return null;

  // Ensure both users are checked into the same venue
  const userARef = doc(db, 'users', userAId);
  const userBRef = doc(db, 'users', userBId);
  const [userASnap, userBSnap] = await Promise.all([getDoc(userARef), getDoc(userBRef)]);
  if (!userASnap.exists() || !userBSnap.exists()) return null;

  const a = userASnap.data();
  const b = userBSnap.data();
  const sameVenue = a?.currentVenue === venueId && b?.currentVenue === venueId;
  if (!sameVenue) return null;

  // Avoid duplicates: check if a match already exists with same participants and venue
  const matchesRef = collection(db, 'matches');
  const q1 = query(matchesRef, where('participants', 'array-contains', userAId), where('venueId', '==', venueId));
  const existing = await getDocs(q1);
  if (!existing.empty) {
    const maybe = existing.docs.find(d => {
      const participants: string[] = d.data().participants || [];
      return participants.includes(userAId) && participants.includes(userBId);
    });
    if (maybe) return maybe.id;
  }

  const createdAt = Date.now();
  const expiresAt = createdAt + 3 * 60 * 60 * 1000; // 3h
  const matchId = `${userAId}_${userBId}_${venueId}_${createdAt}`;

  await setDoc(doc(matchesRef, matchId), {
    participants: [userAId, userBId],
    venueId,
    createdAt,
    expiresAt,
    // Also store server timestamps for consistency with existing schema
    createdAtServer: serverTimestamp(),
  });

  return matchId;
}