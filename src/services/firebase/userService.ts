import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '@/types/UserProfile';
import { Match } from '@/types/match.types';

type PartialUserProfile = Partial<UserProfile>;

// ✅ Fetch user profile
export const fetchUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...(userSnap.data() as UserProfile) };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// ✅ Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: PartialUserProfile
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, updates, { merge: true });
};

// ✅ Like user
export const likeUser = async (
  currentUser: UserProfile,
  targetUserId: string
): Promise<void> => {
  const updatedLikes = Array.isArray(currentUser.likedUsers)
    ? [...currentUser.likedUsers, targetUserId]
    : [targetUserId];

  await updateUserProfile(currentUser.id, { likedUsers: updatedLikes });
};

// ✅ Check for match and create
export const checkForMatchAndCreate = async (
  userA: UserProfile,
  userBId: string
): Promise<void> => {
  try {
    const userB = await fetchUserProfile(userBId);
    if (!userB || !Array.isArray(userB.likedUsers)) return;

    const userBHasLikedUserA = userB.likedUsers.includes(userA.id);
    if (!userBHasLikedUserA) return;

    await updateUserProfile(userA.id, {
      matches: arrayUnion(userBId),
    });
    await updateUserProfile(userBId, {
      matches: arrayUnion(userA.id),
    });

    console.log('✅ Match created between', userA.id, 'and', userBId);
  } catch (error) {
    console.error('Error creating match:', error);
  }
};

// ✅ Fetch Matches
export const fetchMatches = async (userId: string): Promise<Match[]> => {
  const matchesRef = collection(db, 'matches');
  const q = query(matchesRef, where('userId', '==', userId));
  try {
    const querySnapshot = await getDocs(q);
    const matches: Match[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Match, 'id'>),
    }));
    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

// ✅ Request Reconnect
export const requestReconnect = async (matchId: string): Promise<boolean> => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await setDoc(matchRef, { reconnectRequested: true }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error requesting reconnect:', error);
    return false;
  }
};

// ✅ Confirm Meeting
export const confirmMeeting = async (matchId: string): Promise<boolean> => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await setDoc(matchRef, { met: true }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error confirming meeting:', error);
    return false;
  }
};

// ✅ Share Contact
export const shareContact = async (
  matchId: string,
  contactInfo: string[]
): Promise<boolean> => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await setDoc(matchRef, { sharedContact: contactInfo }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error sharing contact info:', error);
    return false;
  }
};