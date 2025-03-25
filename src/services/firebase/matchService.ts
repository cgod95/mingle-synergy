import { firestore } from '../firebase';
import { MatchService, Match } from '@/types/services';
import { doc, getDoc, getDocs, collection, query, where, updateDoc, addDoc, serverTimestamp, DocumentData } from 'firebase/firestore';

// Helper function to transform Firestore data
const transformFirestoreMatch = (firestoreData: DocumentData, matchId: string): Match => {
  return {
    id: matchId,
    userId: firestoreData?.userId || '',
    matchedUserId: firestoreData?.matchedUserId || '',
    venueId: firestoreData?.venueId || '',
    venueName: firestoreData?.venueName || '',
    timestamp: firestoreData?.timestamp || Date.now(),
    isActive: firestoreData?.isActive !== false,
    expiresAt: firestoreData?.expiresAt || (Date.now() + (3 * 60 * 60 * 1000)),
    contactShared: firestoreData?.contactShared || false,
    userRequestedReconnect: firestoreData?.userRequestedReconnect || false,
    matchedUserRequestedReconnect: firestoreData?.matchedUserRequestedReconnect || false,
    reconnectRequestedAt: firestoreData?.reconnectRequestedAt || null,
    reconnectedAt: firestoreData?.reconnectedAt || null,
    met: firestoreData?.met || false,
    metAt: firestoreData?.metAt || null,
    contactInfo: firestoreData?.contactInfo || undefined,
  };
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
    const newExpiryTime = Date.now() + (3 * 60 * 60 * 1000);
    
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

class FirebaseMatchService implements MatchService {
  async getMatches(userId: string): Promise<Match[]> {
    try {
      // Get matches where user is either the requester or the recipient
      const matchesCollectionRef = collection(firestore, 'matches');
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
      
      const [userMatchesSnapshot, matchedMatchesSnapshot] = await Promise.all([
        getDocs(userMatches),
        getDocs(matchedMatches)
      ]);
      
      const matches: Match[] = [];
      
      // Process matches where user is the requester
      userMatchesSnapshot.forEach(doc => {
        matches.push(transformFirestoreMatch(doc.data(), doc.id));
      });
      
      // Process matches where user is the recipient
      matchedMatchesSnapshot.forEach(doc => {
        matches.push(transformFirestoreMatch(doc.data(), doc.id));
      });
      
      // Sort by newest first
      return matches.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  async createMatch(matchData: Omit<Match, 'id'>): Promise<Match> {
    try {
      const matchesCollectionRef = collection(firestore, 'matches');
      
      // Add timestamp and ensure expiresAt is set
      const newMatchData = {
        ...matchData,
        timestamp: Date.now(),
        isActive: true,
        expiresAt: matchData.expiresAt || (Date.now() + (3 * 60 * 60 * 1000))
      };
      
      const docRef = await addDoc(matchesCollectionRef, newMatchData);
      
      return {
        id: docRef.id,
        ...newMatchData
      };
    } catch (error) {
      console.error('Error creating match:', error);
      throw new Error('Failed to create match');
    }
  }

  async updateMatch(matchId: string, data: Partial<Match>): Promise<void> {
    try {
      const matchDocRef = doc(firestore, 'matches', matchId);
      await updateDoc(matchDocRef, data);
    } catch (error) {
      console.error('Error updating match:', error);
      throw new Error('Failed to update match');
    }
  }

  async requestReconnect(matchId: string, userId: string): Promise<boolean> {
    try {
      const matchDocRef = doc(firestore, 'matches', matchId);
      const matchDoc = await getDoc(matchDocRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }
      
      const matchData = matchDoc.data();
      
      // Verify the user is part of this match
      if (matchData.userId !== userId && matchData.matchedUserId !== userId) {
        throw new Error('Unauthorized');
      }
      
      // Determine who is requesting reconnection
      const isRequestor = matchData.userId === userId;
      const requestField = isRequestor ? 'userRequestedReconnect' : 'matchedUserRequestedReconnect';
      
      // Update the match with the reconnection request
      await updateDoc(matchDocRef, {
        [requestField]: true,
        reconnectRequestedAt: serverTimestamp()
      });
      
      // Check if both users have requested reconnection
      if (isRequestor && matchData.matchedUserRequestedReconnect) {
        await reconnectMatch(matchId);
      } else if (!isRequestor && matchData.userRequestedReconnect) {
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
}

export default new FirebaseMatchService();
