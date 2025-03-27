
import { 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc,
  updateDoc,
  increment,
  Timestamp,
  runTransaction,
  setDoc,
  collection
} from 'firebase/firestore';
import { getDB, isFirebaseAvailable } from '@/firebase/safeFirebase';
import { InterestService } from '@/types/services';
import { FirebaseServiceBase } from './FirebaseServiceBase';
import services from '..';

class FirebaseInterestService extends FirebaseServiceBase implements InterestService {
  private getInterestsCollection() {
    const db = getDB();
    if (!db) return null;
    return collection(db, 'interests');
  }
  
  private getLikesCountCollection() {
    const db = getDB();
    if (!db) return null;
    return collection(db, 'usersLikesCount');
  }
  
  /**
   * Express interest in another user
   */
  public async expressInterest(
    userId: string, 
    targetUserId: string, 
    venueId: string
  ): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot express interest while offline');
      }
      
      // Check if user has likes remaining
      const likesRemaining = await this.getLikesRemaining(userId, venueId);
      
      if (likesRemaining <= 0) {
        throw new Error('No likes remaining at this venue');
      }
      
      // Add interest document
      const interestsCollection = this.getInterestsCollection();
      if (!interestsCollection) {
        throw new Error('Interests collection not available');
      }
      
      await addDoc(interestsCollection, {
        userId,
        targetUserId,
        venueId,
        createdAt: Timestamp.now()
      });
      
      // Decrement likes remaining
      await this.decrementLikesRemaining(userId, venueId);
      
      // Check if there's a mutual interest (other user liked this user)
      const mutualQuery = query(
        interestsCollection,
        where('userId', '==', targetUserId),
        where('targetUserId', '==', userId)
      );
      
      const mutualSnapshot = await getDocs(mutualQuery);
      
      if (!mutualSnapshot.empty) {
        // It's a match! Create a match between the users
        const venue = await services.venue.getVenueById(venueId);
        
        if (venue) {
          await services.match.createMatch(
            userId,
            targetUserId,
            venueId,
            venue.name
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error expressing interest:', error);
      throw error;
    }
  }
  
  /**
   * Get likes remaining for a user at a venue
   */
  public async getLikesRemaining(userId: string, venueId: string): Promise<number> {
    try {
      if (!this.isFirebaseAvailable()) {
        // Return cached likes if offline
        const storedLikes = localStorage.getItem(`likes_${userId}_${venueId}`);
        return storedLikes ? parseInt(storedLikes, 10) : 0;
      }
      
      // Check if user has a likes counter for this venue
      const likesCountCollection = this.getLikesCountCollection();
      if (!likesCountCollection) {
        return 0; // Default to 0 if collection is not available
      }
      
      const likesCounterRef = doc(likesCountCollection, `${userId}_${venueId}`);
      const likesCounterSnap = await getDoc(likesCounterRef);
      
      if (likesCounterSnap.exists()) {
        const data = likesCounterSnap.data();
        return data.remaining || 0;
      } else {
        // Initialize likes counter (default 3 likes per venue)
        await setDoc(likesCounterRef, {
          userId,
          venueId,
          remaining: 3,
          total: 3,
          updatedAt: Timestamp.now()
        });
        
        // Also cache in localStorage
        localStorage.setItem(`likes_${userId}_${venueId}`, '3');
        
        return 3;
      }
    } catch (error) {
      console.error('Error getting likes remaining:', error);
      
      // If error occurred, try local storage
      const storedLikes = localStorage.getItem(`likes_${userId}_${venueId}`);
      return storedLikes ? parseInt(storedLikes, 10) : 0;
    }
  }
  
  /**
   * Decrement likes remaining for a user at a venue
   */
  private async decrementLikesRemaining(userId: string, venueId: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot decrement likes while offline');
      }
      
      const db = getDB();
      if (!db) {
        throw new Error('Firestore not available');
      }
      
      const likesCountCollection = this.getLikesCountCollection();
      if (!likesCountCollection) {
        throw new Error('Likes count collection not available');
      }
      
      const likesCounterRef = doc(likesCountCollection, `${userId}_${venueId}`);
      
      await runTransaction(db, async (transaction) => {
        const likesDoc = await transaction.get(likesCounterRef);
        
        if (!likesDoc.exists()) {
          throw new Error('Likes counter not found');
        }
        
        const remaining = likesDoc.data().remaining || 0;
        
        if (remaining <= 0) {
          throw new Error('No likes remaining');
        }
        
        transaction.update(likesCounterRef, {
          remaining: increment(-1),
          updatedAt: Timestamp.now()
        });
      });
      
      // Also update local storage for offline access
      const currentLikes = localStorage.getItem(`likes_${userId}_${venueId}`);
      if (currentLikes) {
        const remaining = Math.max(0, parseInt(currentLikes, 10) - 1);
        localStorage.setItem(`likes_${userId}_${venueId}`, remaining.toString());
      }
      
      return true;
    } catch (error) {
      console.error('Error decrementing likes:', error);
      throw error;
    }
  }
  
  /**
   * Reset likes for a user at a venue
   */
  public async resetLikes(userId: string, venueId: string): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable()) {
        throw new Error('Cannot reset likes while offline');
      }
      
      const likesCountCollection = this.getLikesCountCollection();
      if (!likesCountCollection) {
        throw new Error('Likes count collection not available');
      }
      
      const likesCounterRef = doc(likesCountCollection, `${userId}_${venueId}`);
      
      await updateDoc(likesCounterRef, {
        remaining: 3, // Reset to default
        updatedAt: Timestamp.now()
      });
      
      // Update local storage
      localStorage.setItem(`likes_${userId}_${venueId}`, '3');
      
      return true;
    } catch (error) {
      console.error('Error resetting likes:', error);
      throw error;
    }
  }
}

export default new FirebaseInterestService();
