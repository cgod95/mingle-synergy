
import { Interest } from '@/types';
import { getFromStorage, saveToStorage } from '@/utils/localStorageUtils';

class MockInterestService {
  // Get remaining likes for a user at a specific venue
  public async getLikesRemaining(userId: string, venueId: string): Promise<number> {
    const key = `likesRemaining-${venueId}`;
    const storedLikes = getFromStorage<number>(key, 3);
    
    // If no likes are stored yet, initialize with 3
    if (storedLikes === null) {
      saveToStorage(key, 3);
      return 3;
    }
    
    return storedLikes;
  }
  
  // Record a like and decrement the remaining count
  public async recordInterest(
    fromUserId: string, 
    toUserId: string, 
    venueId: string
  ): Promise<boolean> {
    try {
      // Get current likes remaining
      const likesRemaining = await this.getLikesRemaining(fromUserId, venueId);
      
      // Return false if no likes remaining
      if (likesRemaining <= 0) {
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
      
      // Update remaining likes
      const newLikesRemaining = likesRemaining - 1;
      saveToStorage(`likesRemaining-${venueId}`, newLikesRemaining);
      
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
    saveToStorage(`likesRemaining-${venueId}`, 3);
  }
}

export default new MockInterestService();
