
import { Interest } from '@/types';
import { getFromStorage, getInterests, saveInterests } from '@/utils/localStorageUtils';
import { InterestService } from '@/types/services';

class MockInterestService implements InterestService {
  // Get remaining likes for a user at a specific venue
  public async getLikesRemaining(userId: string, venueId: string): Promise<number> {
    try {
      // Use a consistent default value of 3 likes per venue
      const DEFAULT_LIKES = 3;
      
      // Check if we have a record for this venue in localStorage
      const key = `likes_${userId}_${venueId}`;
      const storedLikes = localStorage.getItem(key);
      
      if (storedLikes) {
        return parseInt(storedLikes, 10);
      } else {
        // Initialize with DEFAULT_LIKES if no record exists
        localStorage.setItem(key, DEFAULT_LIKES.toString());
        return DEFAULT_LIKES;
      }
    } catch (error) {
      console.error('Error getting remaining likes:', error);
      return 0;
    }
  }
  
  // Decrement likes for a user at a specific venue
  private async decrementLikes(userId: string, venueId: string): Promise<boolean> {
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
  
  // Express interest in another user (implements InterestService interface)
  public async expressInterest(
    userId: string, 
    targetUserId: string, 
    venueId: string
  ): Promise<boolean> {
    try {
      // Try to decrement likes first
      const decrementSuccess = await this.decrementLikes(userId, venueId);
      
      // Return false if no likes remaining
      if (!decrementSuccess) {
        return false;
      }
      
      // Create new interest
      const newInterest: Interest = {
        id: `int_${Date.now()}`,
        fromUserId: userId,
        toUserId: targetUserId,
        venueId,
        timestamp: Date.now(),
        isActive: true,
        expiresAt: Date.now() + (3 * 60 * 60 * 1000)
      };
      
      // Get existing interests from storage
      const existingInterests = getInterests(userId) || [];
      
      // Add new interest
      existingInterests.push(newInterest);
      saveInterests(userId, existingInterests);
      
      return true;
    } catch (error) {
      console.error('Error expressing interest:', error);
      return false;
    }
  }
  
  // Alias for expressInterest to maintain compatibility
  public async recordInterest(
    userId: string, 
    targetUserId: string, 
    venueId: string
  ): Promise<boolean> {
    return this.expressInterest(userId, targetUserId, venueId);
  }
  
  // Reset likes for testing purposes
  public async resetLikes(userId: string, venueId: string): Promise<boolean> {
    try {
      const key = `likes_${userId}_${venueId}`;
      localStorage.setItem(key, '3');
      return true;
    } catch (error) {
      console.error('Error resetting likes:', error);
      return false;
    }
  }
  
  // Get all interests for a user
  public async getUserInterests(userId: string): Promise<Interest[]> {
    const interests = getInterests(userId) || [];
    return interests.filter((interest: Interest) => interest.fromUserId === userId && interest.isActive);
  }
  
  // Get all users who have expressed interest in a particular user
  public async getInterestsForUser(userId: string): Promise<Interest[]> {
    const interests = getFromStorage<Interest[]>('interests', []);
    return interests.filter(interest => interest.toUserId === userId && interest.isActive);
  }
}

export default new MockInterestService();
