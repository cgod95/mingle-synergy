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