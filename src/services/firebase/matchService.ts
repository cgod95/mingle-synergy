
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
    timestamp: firestoreData?.timestamp?.toMillis() || Date.now(),
    isActive: firestoreData?.isActive !== false,
    expiresAt: firestoreData?.expiresAt || (Date.now() + (3 * 60 * 60 * 1000)),
    contactShared: firestoreData?.contactShared || false
  };
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
}

export default new FirebaseMatchService();
