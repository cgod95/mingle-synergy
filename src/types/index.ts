
// User types
export interface User {
  id: string;
  name: string;
  photos: string[];
  bio?: string;
  isCheckedIn: boolean;
  currentVenue?: string;
  isVisible: boolean;
  interests: string[];
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
}

// Interest expression
export interface Interest {
  id: string;
  fromUserId: string;
  toUserId: string;
  venueId: string;
  timestamp: number;
  isActive: boolean;
}
