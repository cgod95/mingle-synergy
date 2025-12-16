import { 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc,
  updateDoc,
  Timestamp,
  orderBy,
  collection,
  serverTimestamp,
  DocumentData,
  deleteDoc,
  arrayUnion,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { getDB, isFirebaseAvailable } from '@/firebase/safeFirebase';
import { Match, MatchService } from '@/types/services';
import { localStorageUtils } from '@/utils/localStorageUtils';
import { FirebaseServiceBase } from './FirebaseServiceBase';
import { FirestoreMatch } from '@/types/match';
import { firestore } from '@/firebase';
import { MATCH_EXPIRY_MS } from '@/lib/matchesCompat';
import { logError, ErrorSeverity } from '@/utils/errorHandler';
import { FEATURE_FLAGS } from '@/lib/flags';

// Use single source of truth for match expiry (24 hours)
const MATCH_EXPIRY_TIME = MATCH_EXPIRY_MS;

class FirebaseMatchService extends FirebaseServiceBase implements MatchService {
  private getMatchesCollection() {
    const db = getDB();
    if (!db) return null;
    return collection(db, 'matches');
  }
  
  /**
   * Get all active matches for a user
   */
  public async getMatches(userId: string): Promise<FirestoreMatch[]> {
    // Return empty array if firestore is not available
    if (!firestore) {
      return [];
    }
    
    const matchesRef = collection(firestore, "matches");
    const now = Date.now();

    // Query for matches where user is userId1
    const q1 = query(matchesRef, where("userId1", "==", userId));
    const snapshot1 = await getDocs(q1);
    
    // Query for matches where user is userId2
    const q2 = query(matchesRef, where("userId2", "==", userId));
    const snapshot2 = await getDocs(q2);

    const allMatches = [
      ...snapshot1.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreMatch)),
      ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreMatch))
    ];

    const activeMatches = allMatches.filter(
      (match: FirestoreMatch) =>
        match.timestamp &&
        typeof match.timestamp === "number" &&
        now - match.timestamp < MATCH_EXPIRY_TIME // Use consistent 24-hour expiry
    );

    return activeMatches.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Create a new match between two users
   */
  public async createMatch(
    user1Id: string, 
    user2Id: string, 
    venueId: string,
    venueName: string
  ): Promise<string> {
    try {
      if (!this.isFirebaseAvailable() || !firestore) {
        throw new Error('Cannot create match while offline');
      }
      
      const matchRef = collection(firestore, 'matches');
      const q = query(
        matchRef,
        where('userId1', 'in', [user1Id, user2Id]),
        where('userId2', 'in', [user1Id, user2Id])
      );

      const snapshot = await getDocs(q);
      const now = Date.now();

      for (const docSnap of snapshot.docs) {
        const match = docSnap.data() as FirestoreMatch;

        const isMatch = (
          (match.userId1 === user1Id && match.userId2 === user2Id) ||
          (match.userId1 === user2Id && match.userId2 === user1Id)
        );

        if (isMatch) {
          const isExpired = now - match.timestamp > MATCH_EXPIRY_TIME;

          if (isExpired) {
            await deleteDoc(doc(firestore, 'matches', docSnap.id));
            break;
          } else {
            // Active match already exists
            return docSnap.id;
          }
        }
      }

      const newMatch = {
        userId1: user1Id,
        userId2: user2Id,
        venueId,
        venueName,
        timestamp: Date.now(),
        messages: [],
      };

      const newDocRef = await addDoc(matchRef, newMatch);
      
      // Track match created event per spec section 9
      try {
        const { trackMatchCreated } = await import('../specAnalytics');
        trackMatchCreated(newDocRef.id, user1Id, user2Id, venueId);
      } catch (error) {
        logError(error as Error, { source: 'matchService', action: 'trackMatchCreated', matchId: newDocRef.id }, ErrorSeverity.WARNING);
      }
      
      return newDocRef.id;
    } catch (error) {
      logError(error as Error, { source: 'matchService', action: 'createMatch', user1Id, user2Id, venueId });
      throw error;
    }
  }

  /**
   * Request reconnection with a match
   * Per spec: Reconnect flow creates fresh match if both parties re-express interest
   */
  public async requestReconnect(matchId: string, userId: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot request reconnect while offline');
      }
      
      // Check feature flag
      const { FEATURE_FLAGS } = await import("@/lib/flags");
      if (!FEATURE_FLAGS.RECONNECT_FLOW_ENABLED) {
        throw new Error('Reconnect flow is disabled');
      }
      
      // Check rematch limit (max 1 rematch per match)
      const { hasRematched, incrementRematchCount } = await import("@/utils/rematchTracking");
      if (hasRematched(matchId)) {
        throw new Error('You have already rematched with this person. Reconnect is only available once per match.');
      }
      
      // Check if user is checked into a venue (required for reconnect)
      const { getCheckedVenueId } = await import("@/lib/checkinStore");
      const checkedInVenueId = getCheckedVenueId();
      if (!checkedInVenueId) {
        throw new Error('You must be checked into a venue to reconnect. Check in to a venue first.');
      }
      
      const matchesCollection = this.getMatchesCollection();
      if (!matchesCollection) {
        throw new Error('Matches collection not available');
      }
      
      // Get match details
      const matchRef = doc(matchesCollection, matchId);
      const matchSnap = await getDoc(matchRef);
      
      if (!matchSnap.exists()) {
        throw new Error('Match not found');
      }
      
      const matchData = matchSnap.data();
      
      // Verify match is expired (per spec: reconnect only for expired matches)
      const now = Date.now();
      const matchTimestamp = matchData.timestamp || 0;
      if (now - matchTimestamp < MATCH_EXPIRY_TIME) {
        throw new Error('Match is still active. Reconnect is only available for expired matches.');
      }
      
      // Determine which user is requesting reconnection
      if (matchData.userId1 === userId) {
        await updateDoc(matchRef, {
          userRequestedReconnect: true,
          reconnectRequestedAt: Timestamp.now()
        });
      } else if (matchData.userId2 === userId) {
        await updateDoc(matchRef, {
          matchedUserRequestedReconnect: true,
          reconnectRequestedAt: Timestamp.now()
        });
      } else {
        throw new Error('User is not part of this match');
      }
      
      // Check if both users have requested reconnection - create fresh match
      const updatedMatchSnap = await getDoc(matchRef);
      const updatedMatchData = updatedMatchSnap.data();
      
      if (updatedMatchData?.userRequestedReconnect && updatedMatchData?.matchedUserRequestedReconnect) {
        // Both users want to reconnect - create fresh match per spec
        const user1Id = updatedMatchData.userId1;
        const user2Id = updatedMatchData.userId2;
        const venueId = updatedMatchData.venueId || 'reconnect-venue';
        const venueName = updatedMatchData.venueName || 'Reconnection';
        
        // Track reconnect requested event per spec section 9
        try {
          const { trackReconnectRequested } = await import('../specAnalytics');
          trackReconnectRequested(matchId, userId);
        } catch (error) {
          logError(error as Error, { source: 'matchService', action: 'trackReconnectRequested', matchId, userId }, ErrorSeverity.WARNING);
        }
        
        // Increment rematch count for both users
        incrementRematchCount(matchId);
        
        // Create fresh match
        const newMatchId = await this.createMatch(user1Id, user2Id, venueId, venueName);
        
        // Track reconnect accepted event per spec section 9
        try {
          const { trackReconnectAccepted } = await import('../specAnalytics');
          trackReconnectAccepted(newMatchId, user1Id, user2Id);
        } catch (error) {
          logError(error as Error, { source: 'matchService', action: 'trackReconnectAccepted', newMatchId, user1Id, user2Id }, ErrorSeverity.WARNING);
        }
        
        // Mark old match as reconnected
        await updateDoc(matchRef, {
          reconnected: true,
          reconnectedAt: Timestamp.now()
        });
      } else {
        // Track reconnect requested event per spec section 9 (single user request)
        try {
          const { trackReconnectRequested } = await import('../specAnalytics');
          trackReconnectRequested(matchId, userId);
        } catch (error) {
          logError(error as Error, { source: 'matchService', action: 'trackReconnectRequested', matchId, userId }, ErrorSeverity.WARNING);
        }
      }
      
      return true;
    } catch (error) {
      logError(error as Error, { source: 'matchService', action: 'requestReconnect', matchId, userId });
      throw error;
    }
  }
  
  /**
   * Send a message in a match
   */
  public async sendMessage(
    matchId: string,
    senderId: string,
    text: string
  ): Promise<boolean> {
    const matchRef = doc(firestore, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      throw new Error('Match not found');
    }

    const match = matchSnap.data() as FirestoreMatch;
    const now = Date.now();

    const isExpired = now - match.timestamp > MATCH_EXPIRY_TIME;
    if (isExpired) {
      throw new Error('Match has expired');
    }

    const messagesFromSender = match.messages.filter(msg => msg.senderId === senderId);
    const messageLimit = typeof FEATURE_FLAGS?.LIMIT_MESSAGES_PER_USER === 'number' && FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER > 0 ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER : 5;
    if (messagesFromSender.length >= messageLimit) {
      throw new Error('Message limit reached');
    }

    const newMessage = {
      senderId,
      text,
      timestamp: now,
    };

    await updateDoc(matchRef, {
      messages: arrayUnion(newMessage),
    });
    
    return true;
  }
  
  /**
   * Calculate time remaining for a match
   */
  public calculateTimeRemaining(expiresAt: Date): string {
    const now = Date.now();
    const timeLeft = expiresAt.getTime() - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  }
  
  // Method required by the MatchTimer component
  public getTimeRemaining(expiresAt: number): string {
    const date = new Date(expiresAt);
    return this.calculateTimeRemaining(date);
  }

  /**
   * Get a match by its ID
   */
  public async getMatchById(matchId: string): Promise<FirestoreMatch | null> {
    const matchRef = doc(firestore, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) return null;
    return { ...(matchSnap.data() as FirestoreMatch), id: matchSnap.id };
  }

  /**
   * Delete a match
   */
  public async deleteMatch(matchId: string): Promise<void> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot delete match while offline');
      }
      
      const matchRef = doc(firestore, 'matches', matchId);
      await deleteDoc(matchRef);
    } catch (error) {
      logError(error as Error, { source: 'matchService', action: 'deleteMatch', matchId });
      throw error;
    }
  }

  /**
   * Like a user and check for mutual match
   */
  public async likeUser(currentUserId: string, targetUserId: string, venueId: string): Promise<void> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot like user while offline');
      }

      // Check if there's already a match between these users
      const existingMatches = await this.getMatches(currentUserId);
      const existingMatch = existingMatches.find(match => 
        (match.userId1 === targetUserId && match.userId2 === currentUserId) ||
        (match.userId1 === currentUserId && match.userId2 === targetUserId)
      );

      if (existingMatch) {
        // Match already exists, don't create another
        return;
      }

      // Check if target user has already liked current user (check likes, not matches)
      // Use the likes collection to check for mutual likes
      if (!firestore) {
        return;
      }
      
      const likesRef = collection(firestore, 'likes');
      const targetUserLikesRef = doc(likesRef, targetUserId);
      const targetUserLikesSnap = await getDoc(targetUserLikesRef);
      
      const targetUserLikes = targetUserLikesSnap.exists() 
        ? targetUserLikesSnap.data()?.likes || [] 
        : [];
      
      const isMutual = targetUserLikes.includes(currentUserId);

      if (isMutual) {
        // Mutual like detected - create a match
        const venue = await this.getVenueName(venueId);
        await this.createMatch(currentUserId, targetUserId, venueId, venue);
      } else {
        // One-way like - just record the like, don't create match yet
        // Store the like in the likes collection
        const currentUserLikesRef = doc(likesRef, currentUserId);
        await setDoc(currentUserLikesRef, { 
          likes: arrayUnion(targetUserId) 
        }, { merge: true });
      }
    } catch (error) {
      logError(error as Error, { source: 'matchService', action: 'likeUser', currentUserId, targetUserId, venueId });
      throw error;
    }
  }

  /**
   * Get venue name by ID
   */
  private async getVenueName(venueId: string): Promise<string> {
    try {
      const venueRef = doc(firestore, 'venues', venueId);
      const venueSnap = await getDoc(venueRef);
      if (venueSnap.exists()) {
        return venueSnap.data().name || 'Unknown Venue';
      }
      return 'Unknown Venue';
    } catch (error) {
      logError(error as Error, { source: 'matchService', action: 'getVenueName', venueId });
      return 'Unknown Venue';
    }
  }

  /**
   * Create a match if mutual like is detected
   */
  public async createMatchIfMutual(userId1: string, userId2: string, venueId: string): Promise<string | null> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot create match while offline');
      }

      if (!firestore) {
        throw new Error('Firestore not available');
      }

      const matchRef = collection(firestore, 'matches');
      const matchQuery = query(
        matchRef,
        where('userId1', 'in', [userId1, userId2]),
        where('userId2', 'in', [userId1, userId2]),
        where('venueId', '==', venueId)
      );

      const snapshot = await getDocs(matchQuery);
      if (!snapshot.empty) {
        return snapshot.docs[0].id; // Match already exists
      }

      const newMatch = {
        userId1,
        userId2,
        venueId,
        timestamp: Date.now(),
        messages: [],
      };

      const docRef = await addDoc(matchRef, {
        ...newMatch,
        timestamp: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      logError(error as Error, { source: 'matchService', action: 'createMatchIfMutual', userId1, userId2, venueId });
      throw error;
    }
  }
}

export default new FirebaseMatchService();

// Export likeUser as a standalone function
export const likeUser = async (currentUserId: string, targetUserId: string, venueId: string): Promise<void> => {
  const matchService = new FirebaseMatchService();
  return matchService.likeUser(currentUserId, targetUserId, venueId);
};

// Export createMatchIfMutual as a standalone function
export const createMatchIfMutual = async (userId1: string, userId2: string, venueId: string): Promise<string | null> => {
  const matchService = new FirebaseMatchService();
  return matchService.createMatchIfMutual(userId1, userId2, venueId);
};

// Export mutual like detection function
export const likeUserWithMutualDetection = async (fromUserId: string, toUserId: string, venueId: string): Promise<void> => {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Cannot like user while offline');
    }

    const fromUserLikesRef = doc(firestore, "likes", fromUserId);
    const toUserLikesRef = doc(firestore, "likes", toUserId);

    // Add the like
    await setDoc(fromUserLikesRef, { likes: arrayUnion(toUserId) }, { merge: true });

    // Check if the other user already liked this user
    const toUserLikesSnap = await getDoc(toUserLikesRef);
    const toUserLikes = toUserLikesSnap.exists() ? toUserLikesSnap.data()?.likes || [] : [];

    const isMutual = toUserLikes.includes(fromUserId);

    if (isMutual) {
      // Check if there's a previous expired match (rematch scenario)
      const previousMatch = await getPreviousMatch(fromUserId, toUserId);
      
      if (previousMatch) {
        // Create a rematch
        await createRematch(fromUserId, toUserId, venueId);
      } else {
        // Create a new match
        await createMatchIfMutual(fromUserId, toUserId, venueId);
      }
    }
  } catch (error) {
    logError(error as Error, { source: 'matchService', action: 'likeUserWithMutualDetection', fromUserId, toUserId, venueId });
    throw error;
  }
};

export const sendMessage = async (
  matchId: string,
  senderId: string,
  text: string
): Promise<void> => {
  const matchRef = doc(firestore, "matches", matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) throw new Error("Match not found");

  const matchData = matchSnap.data() as FirestoreMatch;

  // Match expiry logic
  const matchCreatedAt = matchData.timestamp;
  const now = Date.now();
  const expiresAt = matchCreatedAt + 3 * 60 * 60 * 1000;
  if (now > expiresAt) throw new Error("Match has expired");

  // Message limit per user
  const userMessages = matchData.messages.filter(m => m.senderId === senderId);
  const messageLimit = typeof FEATURE_FLAGS?.LIMIT_MESSAGES_PER_USER === 'number' && FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER > 0 ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER : 5;
  if (userMessages.length >= messageLimit) throw new Error("Message limit reached");

  await updateDoc(matchRef, {
    messages: arrayUnion({
      senderId,
      text,
      timestamp: now,
    }),
  });
};

export const cleanupExpiredMatches = async (): Promise<void> => {
  if (!firestore) {
    return;
  }
  
  const matchRef = collection(firestore, "matches");
  const snapshot = await getDocs(matchRef);
  const now = Date.now();
  const threeHoursMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  const expired = snapshot.docs.filter(doc => {
    const data = doc.data();
    return data.timestamp && (now - data.timestamp) > threeHoursMs;
  });

  await Promise.all(expired.map(doc => deleteDoc(doc.ref)));
};

// New utility functions for match expiration
export const isMatchExpired = (match: FirestoreMatch): boolean => {
  if (!match.timestamp) return true;
  const now = Date.now();
  const matchTime = match.timestamp;
  const diff = now - matchTime;
  return diff > 3 * 60 * 60 * 1000; // 3 hours
};

export const deleteExpiredMatches = async (userId: string) => {
  if (!firestore) {
    return;
  }
  
  const q = query(collection(firestore, "matches"), where("userId1", "==", userId));
  const snapshot = await getDocs(q);

  const deletions = snapshot.docs.map(async (doc) => {
    const data = doc.data() as FirestoreMatch;
    if (isMatchExpired(data)) {
      await deleteDoc(doc.ref);
    }
  });

  await Promise.all(deletions);
};

export const getActiveMatches = async (userId: string): Promise<FirestoreMatch[]> => {
  if (!firestore) {
    return [];
  }
  
  const matchesRef = collection(firestore, "matches");
  const now = Date.now();

  // Query for matches where user is userId1
  const q1 = query(matchesRef, where("userId1", "==", userId));
  const snapshot1 = await getDocs(q1);
  
  // Query for matches where user is userId2
  const q2 = query(matchesRef, where("userId2", "==", userId));
  const snapshot2 = await getDocs(q2);

  const allMatches = [
    ...snapshot1.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreMatch)),
    ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreMatch))
  ];

  const activeMatches = allMatches.filter(
    (match: FirestoreMatch) =>
      match.timestamp &&
      typeof match.timestamp === "number" &&
      now - match.timestamp < 3 * 60 * 60 * 1000 // 3 hours
  );

  return activeMatches.sort((a, b) => b.timestamp - a.timestamp);
};

export const removeLikeBetweenUsers = async (uid1: string, uid2: string) => {
  const ids = [`${uid1}_${uid2}`, `${uid2}_${uid1}`];
  await Promise.all(
    ids.map(id => deleteDoc(doc(firestore, "likes", id)))
  );
};

export const getPreviousMatch = async (uid1: string, uid2: string): Promise<FirestoreMatch | null> => {
  if (!firestore) {
    return null;
  }
  
  const matchesRef = collection(firestore, "matches");
  const now = Date.now();

  // Query for matches where user is userId1
  const q1 = query(matchesRef, where("userId1", "==", uid1));
  const snapshot1 = await getDocs(q1);
  
  // Query for matches where user is userId2
  const q2 = query(matchesRef, where("userId2", "==", uid1));
  const snapshot2 = await getDocs(q2);

  const allMatches = [
    ...snapshot1.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreMatch)),
    ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreMatch))
  ];

  for (const match of allMatches) {
    // Check if this match involves both users
    const involvesBothUsers = (
      (match.userId1 === uid1 && match.userId2 === uid2) ||
      (match.userId1 === uid2 && match.userId2 === uid1)
    );

    if (
      involvesBothUsers &&
      match.timestamp &&
      typeof match.timestamp === "number" &&
      now - match.timestamp >= 3 * 60 * 60 * 1000 // expired
    ) {
      return match;
    }
  }

  return null;
};

export const canRematch = async (uid1: string, uid2: string): Promise<boolean> => {
  const previousMatch = await getPreviousMatch(uid1, uid2);
  return previousMatch !== null;
};

export const createRematch = async (uid1: string, uid2: string, venueId: string): Promise<string | null> => {
  try {
    if (!isFirebaseAvailable() || !firestore) {
      throw new Error('Cannot create rematch while offline');
    }

    // Check if there's a previous expired match
    const previousMatch = await getPreviousMatch(uid1, uid2);
    if (!previousMatch) {
      throw new Error('No previous match found for rematch');
    }

    // Delete the old expired match
    await deleteDoc(doc(firestore, "matches", previousMatch.id));

    // Create a new match
    const matchRef = collection(firestore, 'matches');
    const newMatch = {
      userId1: uid1,
      userId2: uid2,
      venueId,
      timestamp: Date.now(),
      messages: [],
      isRematch: true, // Flag to indicate this is a rematch
    };

    const newDocRef = await addDoc(matchRef, newMatch);
    return newDocRef.id;
  } catch (error) {
    logError(error as Error, { source: 'matchService', action: 'createRematch', uid1, uid2, venueId });
    throw error;
  }
};

/**
 * Get all matches for a user (both active and expired)
 */
export const getAllMatchesForUser = async (userId: string) => {
  if (!firestore) {
    return [];
  }
  
  const matchesRef = collection(firestore, 'matches');
  
  // Query for matches where user is userId1
  const q1 = query(matchesRef, where('userId1', '==', userId));
  const snapshot1 = await getDocs(q1);
  
  // Query for matches where user is userId2
  const q2 = query(matchesRef, where('userId2', '==', userId));
  const snapshot2 = await getDocs(q2);

  const allMatches = [...snapshot1.docs, ...snapshot2.docs];
  const matches = [];

  for (const match of allMatches) {
    const data = match.data() as FirestoreMatch;
    matches.push({ ...data, id: match.id }); // Ensure id from document takes precedence
  }

  return matches.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
};

/**
 * Get all active (non-expired) matches for a user and delete expired ones.
 */
export const getActiveMatchesForUser = async (userId: string) => {
  if (!firestore) {
    return [];
  }
  
  const now = Date.now();
  const threeHoursInMs = 3 * 60 * 60 * 1000;

  const matchesRef = collection(firestore, 'matches');
  // Query for matches where user is userId1
  const q1 = query(matchesRef, where('userId1', '==', userId));
  const snapshot1 = await getDocs(q1);
  // Query for matches where user is userId2
  const q2 = query(matchesRef, where('userId2', '==', userId));
  const snapshot2 = await getDocs(q2);

  const allMatches = [...snapshot1.docs, ...snapshot2.docs];
  const activeMatches = [];

  for (const match of allMatches) {
    const data = match.data();
    const createdAt = typeof data.timestamp === 'number' ? data.timestamp : 0;
    if (now - createdAt <= threeHoursInMs) {
      activeMatches.push({ id: match.id, ...data });
    } else {
      // Mark expired matches with the new structure instead of deleting
      await expireMatch(match.id);
    }
  }

  return activeMatches;
};

/**
 * Mark a match as expired with explicit flag for frontend
 */
export async function expireMatch(matchId: string) {
  const matchRef = doc(firestore, 'matches', matchId);
  await updateDoc(matchRef, {
    expiredAt: serverTimestamp(),
    matchExpired: true, // ✅ add explicit flag for frontend
  });
}

/**
 * Rematch flow: expire the match, remove likes, and send a new like from the current user to the other user
 */
export async function rematchUser(currentUserId: string, otherUserId: string) {
  // Remove likes between users
  await removeLikeBetweenUsers(currentUserId, otherUserId);

  // Add a new like from current user to other user
  const fromUserLikesRef = doc(firestore, 'likes', currentUserId);
  await setDoc(fromUserLikesRef, { likes: arrayUnion(otherUserId) }, { merge: true });
}

/**
 * Confirm that users have actually met at the venue
 * This helps improve match quality and enables better reconnection features
 */
export async function confirmWeMet(matchId: string, userId: string): Promise<void> {
  try {
    if (!isFirebaseAvailable()) {
      throw new Error('Cannot confirm we met while offline');
    }

    const matchRef = doc(firestore, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      throw new Error('Match not found');
    }

    const matchData = matchSnap.data() as FirestoreMatch;
    
    // Verify the user is part of this match
    if (matchData.userId1 !== userId && matchData.userId2 !== userId) {
      throw new Error('User is not part of this match');
    }

    // Update the match with the new confirmation structure
    await updateDoc(matchRef, {
      [`confirmations.${userId}`]: true,
      [`confirmedAt.${userId}`]: new Date().toISOString(),
      // Keep the old fields for backward compatibility
      weMetConfirmed: true,
      weMetConfirmedBy: userId,
      weMetConfirmedAt: serverTimestamp(),
    });

    // You could also update user profiles or send notifications here
    // For example, increment a "successful meets" counter on user profiles
    
  } catch (error) {
    logError(error as Error, { source: 'matchService', action: 'confirmWeMet', matchId, userId });
    throw error;
  }
}
