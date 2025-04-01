export interface UserProfile {
    id: string;
    name: string;
    age: number;
    gender: string;
    photos: string[];
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
  }