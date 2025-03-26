
import { Interest } from '@/types';
import { getFromStorage, saveToStorage } from '@/utils/localStorageUtils';

class MockInterestService {
  // Get remaining likes for a user at a specific venue
  public async getLikesRemaining(userId: string, venueId: string): Promise<number> {
    try {
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
    } catch (error) {
      console.error('Error getting remaining likes:', error);
      return 0;
    }
  }
  
  // Decrement likes for a user at a specific venue
  public async decrementLikes(userId: string, venueId: string): Promise<boolean> {
    try {
      const key = `likes_${userId}_${venueId}`;
      const storedLikes = localStorage.getItem(key);
      const current = storedLikes ? parseInt(storedLikes, 10) : 0;
      
      if (current > 0) {
        localStorage.setItem(key, (current - 1).toString());
        return true;
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
