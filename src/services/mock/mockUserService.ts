
import { UserService, UserProfile } from '@/types/services';
import { users } from '@/data/mockData';

class MockUserService implements UserService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Find the user in our mock data
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return null;
    }
    
    // Convert app User to UserProfile
    const userProfile: UserProfile = {
      id: user.id,
      name: user.name,
      photos: user.photos,
      bio: user.bio || '',
      occupation: user.occupation || '',
      isCheckedIn: user.isCheckedIn,
      currentVenue: user.currentVenue,
      currentZone: user.currentZone,
      isVisible: user.isVisible,
      interests: user.interests,
      gender: user.gender as string, // Type assertion to handle string type
      interestedIn: user.interestedIn as string[], // Type assertion for array of strings
      age: user.age,
      ageRangePreference: user.ageRangePreference,
      matches: user.matches,
      likedUsers: user.likedUsers,
      blockedUsers: user.blockedUsers,
    };
    
    return userProfile;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update the user with the provided data
    users[userIndex] = {
      ...users[userIndex],
      ...data,
    };
    
    console.log(`[Mock] Updated user ${userId} with:`, data);
  }

  async createUserProfile(userId: string, data: UserProfile): Promise<void> {
    // Check if user already exists
    if (users.some(u => u.id === userId)) {
      throw new Error('User already exists');
    }
    
    // Cast gender and interestedIn to the correct types
    const gender = data.gender as 'male' | 'female' | 'non-binary' | 'other' | undefined;
    const interestedIn = data.interestedIn as ('male' | 'female' | 'non-binary' | 'other')[] | undefined;
    
    // Add the new user to our mock data
    users.push({
      ...data,
      id: userId,
      isCheckedIn: data.isCheckedIn || false,
      isVisible: data.isVisible || true,
      interests: data.interests || [],
      gender,
      interestedIn,
    } as any);
    
    console.log(`[Mock] Created new user profile for ${userId}`);
  }
}

export default new MockUserService();
