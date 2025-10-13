import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  arrayUnion, 
  arrayRemove, 
  Timestamp,
  DocumentData,
  onSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/firebase';
import { MatchService } from '@/types/services';
import { FirestoreMatch } from '@/types/match';
import { FirebaseServiceBase } from './FirebaseServiceBase';
import logger from '@/utils/Logger';

const MATCH_EXPIRY_TIME = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

class FirebaseMatchService extends FirebaseServiceBase implements MatchService {
  private getMatchesCollection() {
    return this.getCollection('matches');
  }

  public async getMatches(userId: string): Promise<FirestoreMatch[]> {
    try {
      if (!this.isFirebaseAvailable()) {
        return [];
      }
      
      const matchesCollection = this.getMatchesCollection();
      if (!matchesCollection) {
        return [];
      }
      
      const q = query(
        matchesCollection,
        where('user1Id', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const matches: FirestoreMatch[] = [];
      
      querySnapshot.forEach((doc) => {
        const matchData = doc.data() as FirestoreMatch;
        // Check if match is expired and delete if so
        if (this.isMatchExpired(matchData)) {
          this.deleteExpiredMatch(doc.id);
        } else {
          matches.push({
            ...matchData,
            id: doc.id
          } as FirestoreMatch);
        }
      });
      
      // Also get matches where user is user2Id
      const q2 = query(
        matchesCollection,
        where('user2Id', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach((doc) => {
        const matchData = doc.data() as FirestoreMatch;
        // Check if match is expired and delete if so
        if (this.isMatchExpired(matchData)) {
          this.deleteExpiredMatch(doc.id);
        } else {
          matches.push({
            ...matchData,
            id: doc.id
          } as FirestoreMatch);
        }
      });
      
      return matches;
    } catch (error) {
      this.handleError(error, 'getMatches');
    }
  }

  private isMatchExpired(match: FirestoreMatch): boolean {
    if (!match.timestamp) return true;
    const now = Date.now();
    const matchTime = match.timestamp;
    const diff = now - matchTime;
    return diff > 3 * 60 * 60 * 1000; // 3 hours
  }

  private async deleteExpiredMatch(matchId: string): Promise<void> {
    try {
      const matchRef = doc(db, 'matches', matchId);
      await deleteDoc(matchRef);
      logger.info('Deleted expired match', { matchId });
    } catch (error) {
      logger.error('Error deleting expired match', error, { matchId });
    }
  }

  /**
   * Get matches with real-time listener that automatically removes expired matches
   */
  public getMatchesWithListener(userId: string, callback: (matches: FirestoreMatch[]) => void): () => void {
    if (!this.isFirebaseAvailable()) {
      callback([]);
      return () => {};
    }

    const matchesCollection = this.getMatchesCollection();
    if (!matchesCollection) {
      callback([]);
      return () => {};
    }

    // Listen to matches where user is userId1 or userId2
    const q1 = query(
      matchesCollection,
      where('userId1', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const q2 = query(
      matchesCollection,
      where('userId2', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      this.handleMatchesSnapshot(snapshot, callback, userId);
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      this.handleMatchesSnapshot(snapshot, callback, userId);
    });

    // Return cleanup function
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }

  private handleMatchesSnapshot(snapshot: QuerySnapshot, callback: (matches: FirestoreMatch[]) => void, userId: string) {
    const matches: FirestoreMatch[] = [];
    
    snapshot.forEach((doc) => {
      const matchData = doc.data() as FirestoreMatch;
      if (this.isMatchExpired(matchData)) {
        this.deleteExpiredMatch(doc.id);
      } else {
        matches.push({
          ...matchData,
          id: doc.id
        } as FirestoreMatch);
      }
    });

    callback(matches);
  }

  /**
   * Check if two users can rematch (both must be checked into the same venue)
   */
  public async canRematch(userId1: string, userId2: string, venueId: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        return false;
      }

      // Get both users' profiles
      const user1Profile = await this.getUserProfile(userId1);
      const user2Profile = await this.getUserProfile(userId2);

      if (!user1Profile || !user2Profile) {
        return false;
      }

      // Check if both users are checked into the same venue
      const bothCheckedIn = user1Profile.currentVenue === venueId && user2Profile.currentVenue === venueId;
      
      // Check if there's no active match between them
      const existingMatches = await this.getMatches(userId1);
      const hasActiveMatch = existingMatches.some(match => 
        (match.userId1 === userId2 || match.userId2 === userId2) && !this.isMatchExpired(match)
      );

      return bothCheckedIn && !hasActiveMatch;
    } catch (error) {
      logger.error('Error checking rematch possibility', error, { userId1, userId2, venueId });
      return false;
    }
  }

  private async getUserProfile(userId: string): Promise<DocumentData | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      logger.error('Error getting user profile', error, { userId });
      return null;
    }
  }

  public async createMatch(
    user1Id: string, 
    user2Id: string, 
    venueId: string,
    venueName: string
  ): Promise<string> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot create match while offline');
      }
      
      const matchesCollection = this.getMatchesCollection();
      if (!matchesCollection) {
        throw new Error('Matches collection not available');
      }
      
      const now = Date.now();
      const newMatch = {
        user1Id,
        user2Id,
        venueId,
        venueName,
        timestamp: now,
        matchedAt: now, // Add matchedAt timestamp
        messages: [],
        isExpired: false,
        userRequestedReconnect: false,
        matchedUserRequestedReconnect: false,
        reconnectRequestedAt: null,
        userConfirmedWeMet: false,
        matchedUserConfirmedWeMet: false
      };

      const newDocRef = await addDoc(matchesCollection, newMatch);
      return newDocRef.id;
    } catch (error) {
      logger.error('Error creating match', error, { user1Id, user2Id, venueId });
      throw error;
    }
  }

  /**
   * Request reconnection with a match
   */
  public async requestReconnect(matchId: string, userId: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot request reconnect while offline');
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
      
      // Determine which user is requesting reconnection
      if (matchData.user1Id === userId) {
        await updateDoc(matchRef, {
          userRequestedReconnect: true,
          reconnectRequestedAt: Timestamp.now()
        });
      } else if (matchData.user2Id === userId) {
        await updateDoc(matchRef, {
          matchedUserRequestedReconnect: true,
          reconnectRequestedAt: Timestamp.now()
        });
      } else {
        throw new Error('User is not part of this match');
      }
      
      return true;
    } catch (error) {
      logger.error('Error requesting reconnect', error, { matchId, userId });
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
    const matchRef = doc(db, 'matches', matchId);
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
    if (messagesFromSender.length >= 3) {
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
    const matchRef = doc(db, 'matches', matchId);
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
      
      const matchRef = doc(db, 'matches', matchId);
      await deleteDoc(matchRef);
    } catch (error) {
      logger.error('Error deleting match', error, { matchId });
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

      // Add the like to the likes collection
      const fromUserLikesRef = doc(db, "likes", currentUserId);
      await setDoc(fromUserLikesRef, { 
        likes: arrayUnion(targetUserId),
        venueId,
        timestamp: Timestamp.now()
      }, { merge: true });

      // Check if the other user also likes this user
      const toUserLikesRef = doc(db, "likes", targetUserId);
      const toUserLikesSnap = await getDoc(toUserLikesRef);
      
      if (toUserLikesSnap.exists()) {
        const toUserLikes = toUserLikesSnap.data();
        if (toUserLikes?.likes && toUserLikes.likes.includes(currentUserId)) {
          // Mutual like detected! Create a match
          const venue = await this.getVenueName(venueId);
          await this.createMatch(currentUserId, targetUserId, venueId, venue);
          
          // Clean up likes after creating match
          await this.removeLikeBetweenUsers(currentUserId, targetUserId);
        }
      }
    } catch (error) {
      logger.error('Error liking user', error, { currentUserId, targetUserId, venueId });
      throw error;
    }
  }

  /**
   * Remove likes between two users
   */
  private async removeLikeBetweenUsers(uid1: string, uid2: string): Promise<void> {
    try {
      const user1LikesRef = doc(db, "likes", uid1);
      const user2LikesRef = doc(db, "likes", uid2);

      await updateDoc(user1LikesRef, {
        likes: arrayRemove(uid2)
      });

      await updateDoc(user2LikesRef, {
        likes: arrayRemove(uid1)
      });
    } catch (error) {
      logger.error('Error removing likes between users', error, { uid1, uid2 });
    }
  }

  /**
   * Get venue name by ID
   */
  private async getVenueName(venueId: string): Promise<string> {
    try {
      const venueRef = doc(db, 'venues', venueId);
      const venueSnap = await getDoc(venueRef);
      if (venueSnap.exists()) {
        return venueSnap.data().name || 'Unknown Venue';
      }
      return 'Unknown Venue';
    } catch (error) {
      logger.error('Error getting venue name', error, { venueId });
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

      const matchRef = collection(db, 'matches');
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
        timestamp: Timestamp.now(),
      });

      return docRef.id;
    } catch (error) {
      logger.error('Error creating mutual match', error, { userId1, userId2, venueId });
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
    // Check if both users like each other
    const fromUserLikesRef = doc(db, "likes", fromUserId);
    const toUserLikesRef = doc(db, "likes", toUserId);

    // Add the like
    await setDoc(fromUserLikesRef, { likes: arrayUnion(toUserId) }, { merge: true });

    // Check if the other user also likes this user
    const toUserLikesSnap = await getDoc(toUserLikesRef);
    if (toUserLikesSnap.exists()) {
      const toUserLikes = toUserLikesSnap.data();
      if (toUserLikes?.likes && toUserLikes.likes.includes(fromUserId)) {
        // Mutual like detected! Create a match
        await createMatchIfMutual(fromUserId, toUserId, venueId);
      }
    }
  } catch (error) {
    logger.error('Error in likeUserWithMutualDetection', error);
    throw error;
  }
};

export const sendMessage = async (
  matchId: string,
  senderId: string,
  text: string
): Promise<void> => {
  const matchRef = doc(db, "matches", matchId);
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
  if (userMessages.length >= 3) throw new Error("Message limit reached");

  await updateDoc(matchRef, {
    messages: arrayUnion({
      senderId,
      text,
      timestamp: now,
    }),
  });
};

export const cleanupExpiredMatches = async (): Promise<void> => {
  const matchRef = collection(db, "matches");
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
  const q = query(collection(db, "matches"), where("userId1", "==", userId));
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
  const matchesRef = collection(db, "matches");
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
    ids.map(id => deleteDoc(doc(db, "likes", id)))
  );
};

export const getPreviousMatch = async (uid1: string, uid2: string): Promise<FirestoreMatch | null> => {
  const matchesRef = collection(db, "matches");
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
    // Get the previous match
    const previousMatch = await getPreviousMatch(uid1, uid2);
    if (!previousMatch) {
      return null;
    }

    // Delete the old expired match
    await deleteDoc(doc(db, "matches", previousMatch.id));

    // Create a new match
    const matchRef = collection(db, 'matches');
    const newMatch = {
      userId1: uid1,
      userId2: uid2,
      venueId,
      timestamp: Date.now(),
      expiresAt: Date.now() + (3 * 60 * 60 * 1000), // 3 hours
      isActive: true,
      isRematch: true,
      previousMatchId: previousMatch.id
    };

    const docRef = await addDoc(matchRef, newMatch);
    return docRef.id;
  } catch (error) {
    logger.error('Error creating rematch', error);
    return null;
  }
};

/**
 * Get all matches for a user (both active and expired)
 */
export const getAllMatchesForUser = async (userId: string) => {
  const matchesRef = collection(db, 'matches');
  
  // Query for matches where user is userId1
  const q1 = query(matchesRef, where('userId1', '==', userId));
  const snapshot1 = await getDocs(q1);
  
  // Query for matches where user is userId2
  const q2 = query(matchesRef, where('userId2', '==', userId));
  const snapshot2 = await getDocs(q2);
  
  const matches: FirestoreMatch[] = [];
  
  snapshot1.forEach((doc) => {
    const data = doc.data();
    matches.push({
      id: doc.id,
      ...data
    } as FirestoreMatch);
  });
  
  snapshot2.forEach((doc) => {
    const data = doc.data();
    matches.push({
      id: doc.id,
      ...data
    } as FirestoreMatch);
  });
  
  return matches;
};

/**
 * Get all active (non-expired) matches for a user and delete expired ones.
 */
export const getActiveMatchesForUser = async (userId: string) => {
  const threeHoursInMs = 3 * 60 * 60 * 1000;

  const matchesRef = collection(db, 'matches');
  // Query for matches where user is userId1
  const q1 = query(matchesRef, where('userId1', '==', userId));
  const snapshot1 = await getDocs(q1);
  
  // Query for matches where user is userId2
  const q2 = query(matchesRef, where('userId2', '==', userId));
  const snapshot2 = await getDocs(q2);
  
  const activeMatches: FirestoreMatch[] = [];
  const now = Date.now();
  
  snapshot1.forEach((doc) => {
    const data = doc.data();
    const match = {
      id: doc.id,
      ...data
    } as FirestoreMatch;
    
    if (match.timestamp && (now - match.timestamp) < threeHoursInMs) {
      activeMatches.push(match);
    }
  });
  
  snapshot2.forEach((doc) => {
    const data = doc.data();
    const match = {
      id: doc.id,
      ...data
    } as FirestoreMatch;
    
    if (match.timestamp && (now - match.timestamp) < threeHoursInMs) {
      activeMatches.push(match);
    }
  });
  
  return activeMatches;
};

/**
 * Mark a match as expired with explicit flag for frontend
 */
export async function expireMatch(matchId: string) {
  const matchRef = doc(db, 'matches', matchId);
  await updateDoc(matchRef, {
    expiredAt: Timestamp.now(),
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
  const fromUserLikesRef = doc(db, 'likes', currentUserId);
  await setDoc(fromUserLikesRef, { likes: arrayUnion(otherUserId) }, { merge: true });
}

/**
 * Confirm that users have actually met at the venue
 * This helps improve match quality and enables better reconnection features
 */
export async function confirmWeMet(matchId: string, userId: string): Promise<void> {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      throw new Error('Match not found');
    }

    const matchData = matchSnap.data();
    if (!matchData) {
      throw new Error('Match data is null');
    }

    // Update the match to mark that this user confirmed they met
    await updateDoc(matchRef, {
      [`metBy.${userId}`]: true,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    logger.error('Error confirming we met', error);
    throw error;
  }
}

// Mark all messages in a match as read by a user
export const markMessagesRead = async (matchId: string, userId: string): Promise<void> => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const snap = await getDoc(matchRef);
    if (!snap.exists()) return;
    const data = snap.data();
    if (!Array.isArray(data.messages)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedMessages = data.messages.map((m: any) => {
      if (m.senderId === userId) return m; // don't add readBy for own messages
      const readBy: string[] = m.readBy || [];
      if (readBy.includes(userId)) return m;
      return { ...m, readBy: [...readBy, userId] };
    });

    await updateDoc(matchRef, { messages: updatedMessages });
  } catch (error) {
    logger.error('Error marking messages read', error);
  }
};
