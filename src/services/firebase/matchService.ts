
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
  collection
} from 'firebase/firestore';
import { getDB, isFirebaseAvailable } from '@/firebase/safeFirebase';
import { Match, MatchService } from '@/types/services';
import { localStorageUtils } from '@/utils/localStorageUtils';
import { FirebaseServiceBase } from './FirebaseServiceBase';
import services from '..';

// Match expiry time in milliseconds (3 hours)
const MATCH_EXPIRY_TIME = 3 * 60 * 60 * 1000;

class FirebaseMatchService extends FirebaseServiceBase implements MatchService {
  private getMatchesCollection() {
    const db = getDB();
    if (!db) return null;
    return collection(db, 'matches');
  }
  
  /**
   * Get all active matches for a user
   */
  public async getMatches(userId: string): Promise<Match[]> {
    try {
      // Check if Firebase is available
      if (!this.isFirebaseAvailable()) {
        console.log('Firebase unavailable: returning cached matches');
        const cachedMatches = localStorageUtils.getItem(`matches_${userId}`);
        if (cachedMatches) {
          return JSON.parse(cachedMatches);
        }
        return [];
      }
      
      // Get collection safely
      const matchesCollection = this.getMatchesCollection();
      if (!matchesCollection) {
        throw new Error('Matches collection not available');
      }
      
      // Query for matches where the user is either user1 or user2
      const user1Matches = query(
        matchesCollection,
        where('user1Id', '==', userId),
        where('expiresAt', '>', Timestamp.now()),
        orderBy('expiresAt')
      );
      
      const user2Matches = query(
        matchesCollection,
        where('user2Id', '==', userId),
        where('expiresAt', '>', Timestamp.now()),
        orderBy('expiresAt')
      );
      
      const [user1Snapshot, user2Snapshot] = await Promise.all([
        getDocs(user1Matches),
        getDocs(user2Matches)
      ]);
      
      const matches: Match[] = [];
      
      // Process matches where user is user1
      for (const docRef of user1Snapshot.docs) {
        const matchData = docRef.data();
        const otherUser = await services.user.getUserProfile(matchData.user2Id);
        
        if (otherUser) {
          matches.push({
            id: docRef.id,
            userId: matchData.user1Id,
            matchedUserId: matchData.user2Id,
            venueId: matchData.venueId,
            venueName: matchData.venueName,
            timestamp: matchData.createdAt.toDate().getTime(),
            isActive: true,
            expiresAt: matchData.expiresAt.toDate().getTime(),
            contactShared: false,
            userRequestedReconnect: matchData.userRequestedReconnect || false,
            matchedUserRequestedReconnect: matchData.matchedUserRequestedReconnect || false,
            reconnectRequestedAt: matchData.reconnectRequestedAt?.toDate().getTime() || null
          });
        }
      }
      
      // Process matches where user is user2
      for (const docRef of user2Snapshot.docs) {
        const matchData = docRef.data();
        const otherUser = await services.user.getUserProfile(matchData.user1Id);
        
        if (otherUser) {
          matches.push({
            id: docRef.id,
            userId: matchData.user2Id,
            matchedUserId: matchData.user1Id,
            venueId: matchData.venueId,
            venueName: matchData.venueName,
            timestamp: matchData.createdAt.toDate().getTime(),
            isActive: true,
            expiresAt: matchData.expiresAt.toDate().getTime(),
            contactShared: false,
            userRequestedReconnect: matchData.matchedUserRequestedReconnect || false,
            matchedUserRequestedReconnect: matchData.userRequestedReconnect || false,
            reconnectRequestedAt: matchData.reconnectRequestedAt?.toDate().getTime() || null
          });
        }
      }
      
      // Sort by creation date, newest first
      matches.sort((a, b) => b.timestamp - a.timestamp);
      
      // Cache matches for offline access
      localStorageUtils.setItem(`matches_${userId}`, JSON.stringify(matches));
      
      return matches;
    } catch (error) {
      console.error('Error getting matches:', error);
      
      // Try to get cached matches if available
      const cachedMatches = localStorageUtils.getItem(`matches_${userId}`);
      if (cachedMatches) {
        try {
          return JSON.parse(cachedMatches);
        } catch (parseError) {
          console.error('Error parsing cached matches:', parseError);
        }
      }
      
      return [];
    }
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
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot create match while offline');
      }
      
      const matchesCollection = this.getMatchesCollection();
      if (!matchesCollection) {
        throw new Error('Matches collection not available');
      }
      
      // Create expiry timestamp (3 hours from now)
      const expiresAt = new Date(Date.now() + MATCH_EXPIRY_TIME);
      
      // Add match document
      const matchRef = await addDoc(matchesCollection, {
        user1Id,
        user2Id,
        venueId,
        venueName,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
        user1Message: null,
        user2Message: null
      });
      
      return matchRef.id;
    } catch (error) {
      console.error('Error creating match:', error);
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
      console.error('Error requesting reconnect:', error);
      throw error;
    }
  }
  
  /**
   * Send a message in a match
   */
  public async sendMessage(
    matchId: string, 
    userId: string, 
    message: string
  ): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot send message while offline');
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
      
      // Determine which user is sending the message
      if (matchData.user1Id === userId) {
        await updateDoc(matchRef, {
          user1Message: message
        });
      } else if (matchData.user2Id === userId) {
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
}

export default new FirebaseMatchService();
