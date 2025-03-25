
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp, 
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  getFirestore 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  venueId: string;
  venueName?: string;
  timestamp: number;
  isActive: boolean;
  expiresAt: number;
  contactShared: boolean;
  contactInfo?: {
    type: 'phone' | 'instagram' | 'snapchat' | 'custom';
    value: string;
    sharedBy: string;
    sharedAt: number;
  };
}

class MatchService {
  private db = getFirestore();
  private auth = getAuth();
  private MATCH_EXPIRY_TIME = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  
  // Create a new match when there's mutual interest
  public async createMatch(interest1: any, interest2: any, venueInfo: any): Promise<Match | null> {
    try {
      const now = Date.now();
      const expiresAt = now + this.MATCH_EXPIRY_TIME;
      
      const matchData = {
        userId: interest1.fromUserId,
        matchedUserId: interest1.toUserId,
        venueId: interest1.venueId,
        venueName: venueInfo?.name || 'Unknown venue',
        timestamp: now,
        isActive: true,
        expiresAt: expiresAt,
        contactShared: false,
        createdAt: serverTimestamp()
      };
      
      const matchRef = await addDoc(collection(this.db, 'matches'), matchData);
      
      // Send notification to both users
      this.sendMatchNotification(interest1.fromUserId, interest1.toUserId, venueInfo?.name);
      
      return {
        id: matchRef.id,
        ...matchData
      } as Match;
    } catch (error) {
      console.error('Error creating match:', error);
      return null;
    }
  }
  
  // Get active matches for a user
  public async getActiveMatches(userId: string): Promise<Match[]> {
    try {
      const now = Date.now();
      
      const matchesQuery = query(
        collection(this.db, 'matches'),
        where('isActive', '==', true),
        where('expiresAt', '>', now)
      );
      
      const snapshot = await getDocs(matchesQuery);
      
      const matches: Match[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Only include matches where this user is involved
        if (data.userId === userId || data.matchedUserId === userId) {
          matches.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp,
            expiresAt: data.expiresAt
          } as Match);
        }
      });
      
      // Sort by newest first
      return matches.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting active matches:', error);
      return [];
    }
  }
  
  // Get expired matches for a user
  public async getExpiredMatches(userId: string): Promise<Match[]> {
    try {
      const now = Date.now();
      
      const matchesQuery = query(
        collection(this.db, 'matches'),
        where('expiresAt', '<=', now)
      );
      
      const snapshot = await getDocs(matchesQuery);
      
      const matches: Match[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Only include matches where this user is involved
        if (data.userId === userId || data.matchedUserId === userId) {
          matches.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp,
            expiresAt: data.expiresAt,
            isActive: false // Mark as inactive since it's expired
          } as Match);
        }
      });
      
      // Sort by newest first
      return matches.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting expired matches:', error);
      return [];
    }
  }
  
  // Share contact information
  public async shareContact(
    matchId: string, 
    contactInfo: {
      type: 'phone' | 'instagram' | 'snapchat' | 'custom';
      value: string;
    }
  ): Promise<boolean> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) return false;
      
      const matchRef = doc(this.db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) return false;
      
      const matchData = matchDoc.data();
      
      // Verify user is part of this match
      if (matchData.userId !== currentUser.uid && matchData.matchedUserId !== currentUser.uid) {
        return false;
      }
      
      // Update the match with contact info
      await updateDoc(matchRef, {
        contactShared: true,
        contactInfo: {
          ...contactInfo,
          sharedBy: currentUser.uid,
          sharedAt: Date.now()
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error sharing contact:', error);
      return false;
    }
  }
  
  // Listen for new matches in real-time
  public onMatchesUpdated(userId: string, callback: (matches: Match[]) => void): () => void {
    const now = Date.now();
    
    const matchesQuery = query(
      collection(this.db, 'matches'),
      where('isActive', '==', true),
      where('expiresAt', '>', now)
    );
    
    const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
      const matches: Match[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Only include matches where this user is involved
        if (data.userId === userId || data.matchedUserId === userId) {
          matches.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp,
            expiresAt: data.expiresAt
          } as Match);
        }
      });
      
      // Sort by newest first
      const sortedMatches = matches.sort((a, b) => b.timestamp - a.timestamp);
      
      callback(sortedMatches);
    });
    
    return unsubscribe;
  }
  
  // Send match notification (in a real app, this would integrate with FCM or other notification system)
  private async sendMatchNotification(userId1: string, userId2: string, venueName?: string): Promise<void> {
    console.log(`Sending match notification to users ${userId1} and ${userId2} for venue ${venueName || 'unknown'}`);
    
    // In a real implementation, you'd send push notifications to both users
  }
  
  // Helper function to format remaining time
  public formatRemainingTime(expiresAt: number): string {
    const now = Date.now();
    const diff = expiresAt - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  }
}

export const matchService = new MatchService();
