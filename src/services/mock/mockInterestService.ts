
import { Interest } from '@/types';
import { getFromStorage, saveToStorage } from '@/utils/localStorageUtils';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Use mock implementation by default
const USE_MOCK = true;

class MockInterestService {
  // Get remaining likes for a user at a specific venue
  public async getLikesRemaining(userId: string, venueId: string): Promise<number> {
    try {
      // For mock implementation
      if (USE_MOCK) {
        // Check if we have a record for this venue in localStorage
        const key = `likes_${userId}_${venueId}`;
        const storedLikes = localStorage.getItem(key);
        
        if (storedLikes) {
          return parseInt(storedLikes, 10);
        } else {
          // Initialize with 3 likes if no record exists
          localStorage.setItem(key, '3');
          return 3;
        }
      }
      
      // For Firebase implementation
      const likesQuery = query(
        collection(db, 'likes'),
        where('userId', '==', userId),
        where('venueId', '==', venueId)
      );
      
      const snapshot = await getDocs(likesQuery);
      
      if (!snapshot.empty) {
        const likesDoc = snapshot.docs[0];
        const remaining = likesDoc.data().remaining || 0;
        return remaining;
      } else {
        // Create new record with 3 likes
        const likeRef = await addDoc(collection(db, 'likes'), {
          userId,
          venueId,
          remaining: 3,
          timestamp: Date.now()
        });
        
        return 3;
      }
    } catch (error) {
      console.error('Error getting remaining likes:', error);
      return 0;
    }
  }
  
  // Decrement likes for a user at a specific venue
  public async decrementLikes(userId: string, venueId: string): Promise<boolean> {
    try {
      // For mock implementation
      if (USE_MOCK) {
        const key = `likes_${userId}_${venueId}`;
        const storedLikes = localStorage.getItem(key);
        const current = storedLikes ? parseInt(storedLikes, 10) : 0;
        
        if (current > 0) {
          localStorage.setItem(key, (current - 1).toString());
          return true;
        }
        return false;
      }
      
      // For Firebase implementation
      const likesQuery = query(
        collection(db, 'likes'),
        where('userId', '==', userId),
        where('venueId', '==', venueId)
      );
      
      const snapshot = await getDocs(likesQuery);
      
      if (!snapshot.empty) {
        const likesDoc = snapshot.docs[0];
        const remaining = likesDoc.data().remaining || 0;
        
        if (remaining > 0) {
          await updateDoc(doc(db, 'likes', likesDoc.id), {
            remaining: remaining - 1
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error decrementing likes:', error);
      return false;
    }
  }
  
  // Record a like and decrement the remaining count
  public async recordInterest(
    fromUserId: string, 
    toUserId: string, 
    venueId: string
  ): Promise<boolean> {
    try {
      // Try to decrement likes first
      const decrementSuccess = await this.decrementLikes(fromUserId, venueId);
      
      // Return false if no likes remaining
      if (!decrementSuccess) {
        return false;
      }
      
      // Create new interest
      const newInterest: Interest = {
        id: `int_${Date.now()}`,
        fromUserId,
        toUserId,
        venueId,
        timestamp: Date.now(),
        isActive: true,
        expiresAt: Date.now() + (3 * 60 * 60 * 1000)
      };
      
      // Get existing interests from storage
      const existingInterests = getFromStorage<Interest[]>('interests', []);
      
      // Add new interest
      existingInterests.push(newInterest);
      saveToStorage('interests', existingInterests);
      
      return true;
    } catch (error) {
      console.error('Error recording interest:', error);
      return false;
    }
  }
  
  // Get all interests for a user
  public async getUserInterests(userId: string): Promise<Interest[]> {
    const interests = getFromStorage<Interest[]>('interests', []);
    return interests.filter(interest => interest.fromUserId === userId && interest.isActive);
  }
  
  // Get all users who have expressed interest in a particular user
  public async getInterestsForUser(userId: string): Promise<Interest[]> {
    const interests = getFromStorage<Interest[]>('interests', []);
    return interests.filter(interest => interest.toUserId === userId && interest.isActive);
  }
  
  // Reset likes for testing purposes
  public async resetLikesForVenue(userId: string, venueId: string): Promise<void> {
    const key = `likes_${userId}_${venueId}`;
    localStorage.setItem(key, '3');
  }
}

export default new MockInterestService();
