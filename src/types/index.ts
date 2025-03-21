
// User types
export interface User {
  id: string;
  name: string;
  photos: string[];
  bio?: string;
  isCheckedIn: boolean;
  currentVenue?: string;
  currentZone?: string;
  zone?: string; // Added for compatibility with UserCard component
  isVisible: boolean;
  interests: string[];
  gender: 'male' | 'female' | 'non-binary' | 'other';
  interestedIn: ('male' | 'female' | 'non-binary' | 'other')[];
  age: number;
  ageRangePreference: {
    min: number;
    max: number;
  };
  matches: string[]; // IDs of matched users
  likedUsers: string[]; // IDs of users this user has liked
  blockedUsers: string[]; // IDs of users this user has blocked
}

// Venue types
export interface Venue {
  id: string;
  name: string;
  type: 'cafe' | 'bar' | 'restaurant' | 'gym' | 'other';
  address: string;
  image: string;
  checkInCount: number;
  expiryTime: number; // in minutes
  zones?: VenueZone[];
}

export interface VenueZone {
  id: string;
  name: string;
  description?: string;
}

// Match types
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  venueId: string;
  timestamp: number;
  isActive: boolean;
  expiresAt: number;
  contactShared: boolean;
}

// Interest expression
export interface Interest {
  id: string;
  fromUserId: string;
  toUserId: string;
  venueId: string;
  timestamp: number;
  isActive: boolean;
  expiresAt: number;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  isLoading: boolean;
}

// User report
export interface UserReport {
  id: string;
  reportingUserId: string;
  reportedUserId: string;
  reason: 'inappropriate' | 'harassment' | 'fake' | 'other';
  description?: string;
  timestamp: number;
}
