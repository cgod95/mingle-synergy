
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
    
    // Define valid gender values and create a type from them
    const validGenderValues = ['male', 'female', 'non-binary', 'other'] as const;
    type ValidGender = typeof validGenderValues[number];

    // Ensure gender is one of the valid values
    const userGender = data.gender;
    const safeGender: ValidGender = 
      userGender && validGenderValues.includes(userGender as any) 
        ? (userGender as ValidGender) 
        : 'other';
    
    // Ensure interestedIn contains only valid gender values
    const interestedIn = (data.interestedIn || [])
      .filter(gender => validGenderValues.includes(gender as any))
      .map(gender => gender as ValidGender);
    
    // Add the new user to our mock data
    users.push({
      ...data,
      id: userId,
      isCheckedIn: data.isCheckedIn || false,
      isVisible: data.isVisible || true,
      interests: data.interests || [],
      gender: safeGender,
      interestedIn: interestedIn.length ? interestedIn : ['male', 'female'],
    } as any);
    
    console.log(`[Mock] Created new user profile for ${userId}`);
  }
}

export default new MockUserService();
