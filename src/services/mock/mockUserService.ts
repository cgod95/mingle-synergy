import { UserService, UserProfile } from '@/types/services';
import { users } from '@/data/mockData';

// Type guard for gender validation
function isValidGender(gender: string): gender is 'male' | 'female' | 'non-binary' | 'other' {
  return ['male', 'female', 'non-binary', 'other'].includes(gender);
}

// Type guard for interestedIn validation
function areValidGenders(genders: string[]): genders is ('male' | 'female' | 'non-binary' | 'other')[] {
  return Array.isArray(genders) && genders.every(g => isValidGender(g));
}

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
      name: user.name || '',
      photos: user.photos,
      bio: user.bio || '',
      isCheckedIn: user.isCheckedIn,
      currentVenue: user.currentVenue,
      currentZone: user.currentZone,
      isVisible: user.isVisible,
      interests: user.interests,
      gender: isValidGender(user.gender) ? user.gender : 'other',
      interestedIn: areValidGenders(user.interestedIn) ? user.interestedIn : ['other'],
      age: user.age || 25,
      ageRangePreference: user.ageRangePreference || { min: 18, max: 40 },
      matches: user.matches || [],
      likedUsers: user.likedUsers || [],
      blockedUsers: user.blockedUsers || [],
      occupation: user.occupation || '',
    };
    
    return userProfile;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Handle gender validation
    const safeData = { ...data };
    if (data.gender && !isValidGender(data.gender)) {
      safeData.gender = 'other';
    }
    
    // Handle interestedIn validation
    if (data.interestedIn && !areValidGenders(data.interestedIn)) {
      safeData.interestedIn = ['other'] as ('male' | 'female' | 'non-binary' | 'other')[];
    }
    
    // Update the user with the provided data
    users[userIndex] = {
      ...users[userIndex],
      ...safeData,
    };
    
    console.log(`[Mock] Updated user ${userId} with:`, safeData);
  }

  async createUserProfile(userId: string, data: UserProfile): Promise<void> {
    // Check if user already exists
    if (users.some(u => u.id === userId)) {
      throw new Error('User already exists');
    }
    
    // Ensure gender is valid
    const safeGender = isValidGender(data.gender) ? data.gender : 'other';
    
    // Ensure interestedIn is valid
    const safeInterestedIn = areValidGenders(data.interestedIn) ? data.interestedIn : ['other'] as ('male' | 'female' | 'non-binary' | 'other')[];
    
    // Add the new user to our mock data with validated data
    users.push({
      ...data,
      id: userId,
      gender: safeGender,
      interestedIn: safeInterestedIn,
    });
    
    console.log(`[Mock] Created new user profile for ${userId}`);
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    return this.getUserProfile(userId);
  }

  async updateUser(userId: string, data: Partial<UserProfile>): Promise<void> {
    return this.updateUserProfile(userId, data);
  }

  async deleteUser(userId: string): Promise<void> {
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Remove the user from the array
    users.splice(userIndex, 1);
    
    console.log(`[Mock] Deleted user ${userId}`);
  }

  async getUsersAtVenue(venueId: string): Promise<UserProfile[]> {
    // Filter out users checked in at the specified venue
    return users
      .filter(user => user.isCheckedIn && user.currentVenue === venueId && user.isVisible)
      .map(user => ({
        id: user.id,
        name: user.name || '',
        photos: user.photos,
        bio: user.bio || '',
        isCheckedIn: user.isCheckedIn,
        currentVenue: user.currentVenue,
        currentZone: user.currentZone,
        isVisible: user.isVisible,
        interests: user.interests,
        gender: isValidGender(user.gender) ? user.gender : 'other',
        interestedIn: areValidGenders(user.interestedIn) ? user.interestedIn : ['other'],
        age: user.age || 25,
        ageRangePreference: user.ageRangePreference || { min: 18, max: 40 },
        matches: user.matches || [],
        likedUsers: user.likedUsers || [],
        blockedUsers: user.blockedUsers || [],
      }));
  }

  // Add stubs for missing UserService methods
  getReconnectRequests() { return Promise.resolve([]); }
  acceptReconnectRequest() { return Promise.resolve(); }
  sendReconnectRequest() { return Promise.resolve(); }
}

export default new MockUserService();
