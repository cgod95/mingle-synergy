export interface UserProfile {
    id: string;
    name: string;
    age: number;
    gender: string;
    photos: string[];
    photoURL?: string;
    bio: string;
    isCheckedIn: boolean;
    currentVenue?: string;
    currentZone?: string;
    isVisible: boolean;
    interests: string[];
    interestedIn: string[];
    ageRangePreference: { min: number; max: number };
    matches: string[];
    likedUsers: string[];
    blockedUsers: string[];
    isOnboardingComplete?: boolean;
    skippedPhotoUpload?: boolean;
    preferences?: {
        genderPreference?: string;
        minAge?: number;
        maxAge?: number;
    };
    // Extended properties for advanced matching
    communicationStyle?: 'casual' | 'serious' | 'both';
    lifestyle?: 'active' | 'relaxed' | 'both';
    location?: {
        latitude: number;
        longitude: number;
    };
    activityLevel?: 'low' | 'medium' | 'high';
    recentVenues?: string[];
    lastActive?: number;
    checkInTime?: number;
    checkInExpiry?: number;
}

export interface User {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  photoURL?: string;
  gender?: string;
  preferences?: {
    ageRange?: [number, number];
    gender?: string;
  };
  checkedInVenues?: string[];
}