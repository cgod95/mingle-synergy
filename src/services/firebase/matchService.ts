import { firestore } from '@/firebase/config';
import { MatchService, Match, UserProfile } from '@/types/services';
import { doc, getDoc, getDocs, collection, query, where, updateDoc, addDoc, serverTimestamp, DocumentData, Timestamp, deleteDoc, writeBatch, orderBy } from 'firebase/firestore';
import { notificationService } from '../notificationService';
import userService from './userService';
import { FirebaseServiceBase } from './FirebaseServiceBase';
import { getFromStorage, saveToStorage } from '@/utils/localStorageUtils';

// MATCH_EXPIRY_TIME in milliseconds (3 hours)
const MATCH_EXPIRY_TIME = 3 * 60 * 60 * 1000;

// Helper function to transform Firestore data
const transformFirestoreMatch = (firestoreData: DocumentData, matchId: string): Match => {
  return {
    id: matchId,
    userId: firestoreData?.userId || firestoreData?.user1Id || '',
    matchedUserId: firestoreData?.matchedUserId || firestoreData?.user2Id || '',
    venueId: firestoreData?.venueId || '',
    venueName: firestoreData?.venueName || undefined,
    timestamp: firestoreData?.timestamp?.toMillis() || firestoreData?.createdAt?.toMillis() || Date.now(),
    isActive: firestoreData?.isActive !== false,
    expiresAt: firestoreData?.expiresAt?.toMillis() || (Date.now() + MATCH_EXPIRY_TIME),
    contactShared: firestoreData?.contactShared || false,
    userRequestedReconnect: firestoreData?.userRequestedReconnect || false,
    matchedUserRequestedReconnect: firestoreData?.matchedUserRequestedReconnect || false,
    reconnectRequestedAt: firestoreData?.reconnectRequestedAt?.toMillis() || null,
    reconnectedAt: firestoreData?.reconnectedAt?.toMillis() || null,
    met: firestoreData?.met || false,
    metAt: firestoreData?.metAt?.toMillis() || null,
  };
};

// Calculate time remaining until match expires
export const calculateTimeRemaining = (expiresAt: number): string => {
  const now = Date.now();
  const timeLeft = expiresAt - now;
  
  if (timeLeft <= 0) return 'Expired';
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m remaining`;
};

// Function to check for expiring matches and notify users
export const checkExpiringMatches = async (userId: string): Promise<void> => {
  try {
    const matchesCollectionRef = collection(firestore, 'matches');
    
    // Query for matches where the user is either userId or matchedUserId
    const userMatches = query(
      matchesCollectionRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const matchedMatches = query(
      matchesCollectionRef,
      where('matchedUserId', '==', userId),
      where('isActive', '==', true)
    );
    
    // Also try the format from FirebaseMatchService
    const user1Matches = query(
      matchesCollectionRef,
      where('user1Id', '==', userId),
      where('expiresAt', '>', Timestamp.now())
    );
    
    const user2Matches = query(
      matchesCollectionRef,
      where('user2Id', '==', userId),
      where('expiresAt', '>', Timestamp.now())
    );
    
    const [userMatchesSnapshot, matchedMatchesSnapshot, user1MatchesSnapshot, user2MatchesSnapshot] = 
      await Promise.all([
        getDocs(userMatches),
        getDocs(matchedMatches),
        getDocs(user1Matches),
        getDocs(user2Matches)
      ]);
    
    const matches: Match[] = [];
    
    // Process all matches from all formats
    userMatchesSnapshot.forEach(doc => {
      matches.push(transformFirestoreMatch(doc.data(), doc.id));
    });
    
    matchedMatchesSnapshot.forEach(doc => {
      matches.push(transformFirestoreMatch(doc.data(), doc.id));
    });
    
    user1MatchesSnapshot.forEach(doc => {
      matches.push(transformFirestoreMatch(doc.data(), doc.id));
    });
    
    user2MatchesSnapshot.forEach(doc => {
      matches.push(transformFirestoreMatch(doc.data(), doc.id));
    });
    
    const soon = 30 * 60 * 1000; // 30 minutes
    
    matches.forEach(match => {
      const timeLeft = match.expiresAt - Date.now();
      
      // If match will expire within 30 minutes, notify user
      if (timeLeft > 0 && timeLeft <= soon && !match.contactShared) {
        notificationService.showNotification(
          'Match Expiring Soon',
          {
            body: `Your match will expire in ${Math.floor(timeLeft / (1000 * 60))} minutes. Share contact info to keep the connection!`
          }
        );
      }
    });
  } catch (error) {
    console.error('Error checking expiring matches:', error);
  }
};

// Helper function for reconnecting a match
const reconnectMatch = async (matchId: string): Promise<void> => {
  try {
    const matchDocRef = doc(firestore, 'matches', matchId);
    const matchDoc = await getDoc(matchDocRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    
    // Create a new expiry time (3 hours from now)
    const newExpiryTime = Date.now() + MATCH_EXPIRY_TIME;
    
    // Update the match
    await updateDoc(matchDocRef, {
      isActive: true,
      expiresAt: newExpiryTime,
      userRequestedReconnect: false,
      matchedUserRequestedReconnect: false,
      reconnectedAt: serverTimestamp()
    });
    
    // Notify both users
    // This would typically be handled via cloud functions to send push notifications
  } catch (error) {
    console.error('Error reconnecting match:', error);
    throw new Error('Failed to reconnect match');
  }
};

class FirebaseMatchService extends FirebaseServiceBase implements MatchService {
  private matchesCollection = collection(firestore, 'matches');
  
  async getMatches(userId: string): Promise<Match[]> {
    try {
      // Check if we're offline or Firebase is not available
      if (!this.isFirebaseAvailable()) {
        console.log('Offline or Firebase unavailable: returning cached matches');
        const cachedMatches = getFromStorage<Match[]>(`matches_${userId}`, []);
        return cachedMatches;
      }
      
      // We'll query for both formats to support the different data structures
      // Format 1: userId and matchedUserId
      const userMatches = query(
        this.matchesCollection,
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const matchedMatches = query(
        this.matchesCollection,
        where('matchedUserId', '==', userId),
        where('isActive', '==', true)
      );
      
      // Format 2: user1Id and user2Id with expiresAt timestamp
      const user1Matches = query(
        this.matchesCollection,
        where('user1Id', '==', userId),
        where('expiresAt', '>', Timestamp.now()),
        orderBy('expiresAt')
      );
      
      const user2Matches = query(
        this.matchesCollection,
        where('user2Id', '==', userId),
        where('expiresAt', '>', Timestamp.now()),
        orderBy('expiresAt')
      );
      
      const [userMatchesSnapshot, matchedMatchesSnapshot, user1MatchesSnapshot, user2MatchesSnapshot] = 
        await Promise.all([
          getDocs(userMatches),
          getDocs(matchedMatches),
          getDocs(user1Matches),
          getDocs(user2Matches)
        ]);
      
      const matches: Match[] = [];
      
      // Process all matches from all formats
      userMatchesSnapshot.forEach(doc => {
        matches.push(transformFirestoreMatch(doc.data(), doc.id));
      });
      
      matchedMatchesSnapshot.forEach(doc => {
        matches.push(transformFirestoreMatch(doc.data(), doc.id));
      });
      
      // Process matches where user is user1 (from the new format)
      for (const doc of user1MatchesSnapshot.docs) {
        const matchData = doc.data();
        // Only add if not already in the list
        if (!matches.some(m => m.id === doc.id)) {
          matches.push(transformFirestoreMatch(matchData, doc.id));
        }
      }
      
      // Process matches where user is user2 (from the new format)
      for (const doc of user2MatchesSnapshot.docs) {
        const matchData = doc.data();
        // Only add if not already in the list
        if (!matches.some(m => m.id === doc.id)) {
          matches.push(transformFirestoreMatch(matchData, doc.id));
        }
      }
      
      // Sort by newest first
      const sortedMatches = matches.sort((a, b) => b.timestamp - a.timestamp);
      
      // Cache matches for offline access
      saveToStorage(`matches_${userId}`, sortedMatches);
      
      return sortedMatches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      
      // Try to get cached matches if available
      const cachedMatches = getFromStorage<Match[]>(`matches_${userId}`, []);
      return cachedMatches;
    }
  }

  async createMatch(matchData: Omit<Match, 'id'>): Promise<Match> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot create match while offline');
      }
      
      const now = Date.now();
      const expiryTime = matchData.expiresAt || (now + MATCH_EXPIRY_TIME);
      
      // Support both formats for backward compatibility
      const newMatchData: any = {
        // Format 1 fields
        userId: matchData.userId,
        matchedUserId: matchData.matchedUserId,
        venueId: matchData.venueId,
        venueName: matchData.venueName,
        timestamp: serverTimestamp(),
        isActive: true,
        expiresAt: Timestamp.fromDate(new Date(expiryTime)),
        contactShared: false,
        
        // No duplicate fields, use conditional assignment for format 2
        ...(matchData.userId && { user1Id: matchData.userId }),
        ...(matchData.matchedUserId && { user2Id: matchData.matchedUserId }),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(this.matchesCollection, newMatchData);
      
      return {
        id: docRef.id,
        ...matchData,
        timestamp: now,
        isActive: true,
        expiresAt: expiryTime,
        contactShared: false
      };
    } catch (error) {
      console.error('Error creating match:', error);
      throw new Error('Failed to create match');
    }
  }

  async updateMatch(matchId: string, data: Partial<Match>): Promise<void> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot update match while offline');
      }
      
      const matchDocRef = doc(firestore, 'matches', matchId);
      
      // Create a clean data object with only allowed fields
      const cleanData: any = {};
      
      if (data.isActive !== undefined) cleanData.isActive = data.isActive;
      if (data.contactShared !== undefined) cleanData.contactShared = data.contactShared;
      if (data.expiresAt !== undefined) {
        cleanData.expiresAt = Timestamp.fromDate(new Date(data.expiresAt));
      }
      
      // Additional fields for reconnect and met functionality
      if (data.userRequestedReconnect !== undefined) cleanData.userRequestedReconnect = data.userRequestedReconnect;
      if (data.matchedUserRequestedReconnect !== undefined) cleanData.matchedUserRequestedReconnect = data.matchedUserRequestedReconnect;
      if (data.reconnectRequestedAt !== undefined) cleanData.reconnectRequestedAt = serverTimestamp();
      if (data.reconnectedAt !== undefined) cleanData.reconnectedAt = serverTimestamp();
      if (data.met !== undefined) cleanData.met = data.met;
      if (data.metAt !== undefined) cleanData.metAt = serverTimestamp();
      
      await updateDoc(matchDocRef, cleanData);
    } catch (error) {
      console.error('Error updating match:', error);
      throw new Error('Failed to update match');
    }
  }

  async requestReconnect(matchId: string, userId: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot request reconnect while offline');
      }
      
      const matchDocRef = doc(firestore, 'matches', matchId);
      const matchDoc = await getDoc(matchDocRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }
      
      const matchData = matchDoc.data();
      
      // Determine if user is the original user or the matched user
      let isOriginalUser: boolean;
      
      // Check both formats
      if (matchData.userId && matchData.matchedUserId) {
        // Format 1
        if (matchData.userId !== userId && matchData.matchedUserId !== userId) {
          throw new Error('Unauthorized: User is not part of this match');
        }
        isOriginalUser = matchData.userId === userId;
      } else if (matchData.user1Id && matchData.user2Id) {
        // Format 2
        if (matchData.user1Id !== userId && matchData.user2Id !== userId) {
          throw new Error('Unauthorized: User is not part of this match');
        }
        isOriginalUser = matchData.user1Id === userId;
      } else {
        throw new Error('Invalid match data format');
      }
      
      // Update the appropriate reconnect field
      const updateData: any = isOriginalUser
        ? { userRequestedReconnect: true, reconnectRequestedAt: serverTimestamp() }
        : { matchedUserRequestedReconnect: true, reconnectRequestedAt: serverTimestamp() };
      
      await updateDoc(matchDocRef, updateData);
      
      // Check if both users have requested reconnect
      const updatedDoc = await getDoc(matchDocRef);
      const updatedData = updatedDoc.data();
      
      if (updatedData.userRequestedReconnect && updatedData.matchedUserRequestedReconnect) {
        // Both users want to reconnect, so reconnect the match
        await reconnectMatch(matchId);
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting reconnect:', error);
      return false;
    }
  }

  async markAsMet(matchId: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot mark match as met while offline');
      }
      
      const matchDocRef = doc(firestore, 'matches', matchId);
      await updateDoc(matchDocRef, {
        met: true,
        metAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error marking match as met:', error);
      return false;
    }
  }

  // Additional method for cleaning up expired matches
  async cleanupExpiredMatches(): Promise<number> {
    try {
      if (!this.isFirebaseAvailable()) {
        return 0; // Can't clean up while offline
      }
      
      // Create a query for expired matches
      const expiredMatchesQuery = query(
        this.matchesCollection,
        where('expiresAt', '<', Timestamp.now())
      );
      
      const expiredMatches = await getDocs(expiredMatchesQuery);
      
      // Create a batch for efficient updates
      const batch = writeBatch(firestore);
      
      expiredMatches.forEach(doc => {
        // Mark as inactive rather than deleting
        batch.update(doc.ref, { isActive: false });
      });
      
      await batch.commit();
      
      return expiredMatches.size;
    } catch (error) {
      console.error('Error cleaning up expired matches:', error);
      return 0;
    }
  }

  // Method to send a message (from the provided FirebaseMatchService)
  async sendMessage(matchId: string, userId: string, message: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot send message while offline');
      }
      
      // Get match details
      const matchRef = doc(this.matchesCollection, matchId);
      const matchSnap = await getDoc(matchRef);
      
      if (!matchSnap.exists()) {
        throw new Error('Match not found');
      }
      
      const matchData = matchSnap.data();
      
      // Determine which user is sending the message
      if (matchData.user1Id === userId || matchData.userId === userId) {
        await updateDoc(matchRef, {
          user1Message: message
        });
      } else if (matchData.user2Id === userId || matchData.matchedUserId === userId) {
        await updateDoc(matchRef, {
          user2Message: message
        });
      } else {
        throw new Error('User is not part of this match');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Helper method to get the time remaining string
  getTimeRemaining(expiresAt: number): string {
    return calculateTimeRemaining(expiresAt);
  }
}

export default new FirebaseMatchService();
