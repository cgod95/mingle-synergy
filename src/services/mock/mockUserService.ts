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
    let user = users.find(u => u.id === userId);
    
    // If user doesn't exist (e.g., demo user), try to get from localStorage
    if (!user) {
      try {
        const storedUser = localStorage.getItem('mingle:user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id === userId) {
            // Create a basic user entry from localStorage data
            user = {
              id: parsed.id || parsed.uid || userId,
              name: parsed.name || 'Demo User',
              photos: parsed.photos || [],
              bio: parsed.bio || '',
              isCheckedIn: false,
              isVisible: true,
              interests: parsed.interests || [],
              gender: (parsed.gender && isValidGender(parsed.gender)) ? parsed.gender : 'other',
              interestedIn: (parsed.interestedIn && areValidGenders(parsed.interestedIn)) ? parsed.interestedIn : ['other'],
              age: parsed.age || 25,
              ageRangePreference: parsed.ageRangePreference || { min: 18, max: 40 },
              matches: parsed.matches || [],
              likedUsers: parsed.likedUsers || [],
              blockedUsers: parsed.blockedUsers || [],
              occupation: parsed.occupation || '',
            };
            // Add to users array for future lookups
            users.push(user);
          }
        }
      } catch (e) {
        console.warn('[Mock] Could not load user from localStorage:', e);
      }
    }
    
    if (!user) {
      return null;
    }
    
    // Convert app User to UserProfile
    const userProfile: UserProfile = {
      id: user.id,
      name: user.name || 'Demo User',
      displayName: user.name || 'Demo User', // Add displayName for compatibility
      photos: user.photos || [],
      bio: user.bio || '',
      isCheckedIn: user.isCheckedIn ?? false,
      isVisible: user.isVisible ?? true,
      interests: user.interests || [],
      gender: isValidGender(user.gender || '') ? (user.gender || 'other') : 'other',
      interestedIn: areValidGenders(user.interestedIn || []) ? (user.interestedIn || ['other']) : ['other'],
      age: user.age || 25,
      ageRangePreference: user.ageRangePreference || { min: 18, max: 40 },
      matches: user.matches || [],
      likedUsers: user.likedUsers || [],
      blockedUsers: user.blockedUsers || [],
      occupation: user.occupation || '',
    };
    // Handle optional properties conditionally for exactOptionalPropertyTypes
    if (user.currentVenue !== undefined) {
      userProfile.currentVenue = user.currentVenue;
    }
    if (user.currentZone !== undefined) {
      userProfile.currentZone = user.currentZone;
    }
    
    return userProfile;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    let userIndex = users.findIndex(u => u.id === userId);
    
    // If user doesn't exist (e.g., demo user), create them with defaults
    if (userIndex === -1) {
      // Create a new user with defaults
      const newUser = {
        id: userId,
        name: data.displayName || data.name || 'Demo User',
        photos: data.photos || [],
        bio: data.bio || '',
        isCheckedIn: false,
        currentVenue: undefined,
        currentZone: undefined,
        zone: undefined,
        isVisible: data.isVisible !== undefined ? data.isVisible : true,
        interests: data.interests || [],
        gender: (data.gender && isValidGender(data.gender)) ? data.gender : 'other',
        interestedIn: (data.interestedIn && areValidGenders(data.interestedIn)) ? data.interestedIn as ('male' | 'female' | 'non-binary' | 'other')[] : ['other'] as ('male' | 'female' | 'non-binary' | 'other')[],
        age: data.age || 25,
        ageRangePreference: data.ageRangePreference || { min: 18, max: 40 },
        matches: data.matches || [],
        likedUsers: data.likedUsers || [],
        blockedUsers: data.blockedUsers || [],
        occupation: data.occupation || '',
        lastActive: Date.now(),
      };
      users.push(newUser);
      userIndex = users.length - 1;
      console.log(`[Mock] Auto-created user ${userId} for profile update`);
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
    
    // Map displayName to name if provided
    if (data.displayName && !data.name) {
      safeData.name = data.displayName;
    }
    
    // Update the user with the provided data
    const updatedUser = {
      ...users[userIndex],
      ...safeData,
      // Ensure name is updated if displayName was provided
      name: safeData.displayName || safeData.name || users[userIndex].name || 'Demo User',
    };
    users[userIndex] = updatedUser;
    
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
      name: data.name || 'Demo User',
      gender: safeGender,
      interestedIn: safeInterestedIn,
      age: data.age || 25,
      bio: data.bio || '',
      photos: data.photos || [],
      isCheckedIn: data.isCheckedIn ?? false,
      isVisible: data.isVisible ?? true,
      interests: data.interests || [],
      matches: data.matches || [],
      likedUsers: data.likedUsers || [],
      blockedUsers: data.blockedUsers || [],
      ageRangePreference: data.ageRangePreference || { min: 18, max: 40 },
      occupation: data.occupation || '',
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
      .map(user => {
        const userProfile: UserProfile = {
          id: user.id,
          name: user.name || 'Demo User',
          displayName: user.name || 'Demo User',
          photos: user.photos || [],
          bio: user.bio || '',
          isCheckedIn: user.isCheckedIn ?? false,
          isVisible: user.isVisible ?? true,
          interests: user.interests || [],
          gender: isValidGender(user.gender || '') ? (user.gender || 'other') : 'other',
          interestedIn: areValidGenders(user.interestedIn || []) ? (user.interestedIn || ['other']) : ['other'],
          age: user.age || 25,
          ageRangePreference: user.ageRangePreference || { min: 18, max: 40 },
          matches: user.matches || [],
          likedUsers: user.likedUsers || [],
          blockedUsers: user.blockedUsers || [],
        };
        if (user.currentVenue) {
          userProfile.currentVenue = user.currentVenue;
        }
        if (user.currentZone) {
          userProfile.currentZone = user.currentZone;
        }
        return userProfile;
      });
  }

  // Add stubs for missing UserService methods
  getReconnectRequests() { return Promise.resolve([]); }
  acceptReconnectRequest() { return Promise.resolve(); }
  sendReconnectRequest() { return Promise.resolve(); }

  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    // In demo mode, convert file to data URL and store in user profile
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          
          // Get current user profile
          const currentProfile = await this.getUserProfile(userId);
          const currentPhotos = currentProfile?.photos || [];
          
          // Add new photo to photos array
          const updatedPhotos = [...currentPhotos, dataUrl];
          
          // Update user profile with new photo
          await this.updateUserProfile(userId, {
            photos: updatedPhotos
          });
          
          // Also update localStorage for demo user
          try {
            const storedUser = localStorage.getItem('mingle:user');
            if (storedUser) {
              const parsed = JSON.parse(storedUser);
              parsed.photos = updatedPhotos;
              localStorage.setItem('mingle:user', JSON.stringify(parsed));
            }
          } catch (e) {
            console.warn('[Mock] Could not update localStorage:', e);
          }
          
          console.log(`[Mock] Uploaded photo for user ${userId}`);
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
}

export default new MockUserService();
