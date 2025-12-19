// User types
export interface User {
  id: string;
  name?: string;
  photos: string[];
  bio?: string;
  isCheckedIn: boolean;
  currentVenue?: string;
  currentZone?: string;
  zone?: string; // Added for compatibility with UserCard component
  isVisible: boolean;
  interests: string[];
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  interestedIn?: ('male' | 'female' | 'non-binary' | 'other')[];
  age?: number;
  ageRangePreference?: {
    min: number;
    max: number;
  };
  matches?: string[]; // IDs of matched users
  likedUsers?: string[]; // IDs of users this user has liked
  blockedUsers?: string[]; // IDs of users this user has blocked
  // Verification fields
  isVerified?: boolean;
  pendingVerification?: boolean;
  lastVerificationAttempt?: number | null;
  verificationSelfie?: string;
  // Add occupation field
  occupation?: string;
  // Demo/mock fields
  lastCheckIn?: string;
  lastActive?: number;
}

// Venue types
export interface Venue {
  id: string;
  name: string;
  type: 'cafe' | 'bar' | 'restaurant' | 'gym' | 'other' | 'Bakery' | 'Gallery' | 'Outdoor' | 'Cafe' | 'Bar';
  address: string;
  city?: string;
  image: string;
  checkInCount: number;
  expiryTime: number; // in minutes
  zones?: VenueZone[];
  specials?: Special[]; // Add specials property
  vibe?: string;
  event?: string;
  // Add missing properties
  category?: string;
  rating?: number;
  distance?: number;
  description?: string;
  tags?: string[]; // Add tags property for PublicVenue
  categories?: string[]; // Venue categories
}

// Add Special interface for venue specials
export interface Special {
  title: string;
  description: string;
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
  matchedUser?: User; // Make matchedUser optional
  venueId: string;
  venueName?: string;
  timestamp: number;
  isActive: boolean;
  expiresAt: number;
  contactShared: boolean;
  contactInfo?: {
    type: 'phone' | 'instagram' | 'snapchat' | 'custom';
    value: string;
    sharedBy: string;
    sharedAt: string;
  };
  // Add new properties for reconnection feature
  userRequestedReconnect?: boolean;
  matchedUserRequestedReconnect?: boolean;
  reconnectRequestedAt?: number | null;
  reconnectedAt?: number | null;
  // Add property for tracking if users met
  met?: boolean;
  metAt?: number | null;
  // Add message properties
  message?: string | null;
  receivedMessage?: string | null;
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

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  content: string; // Add content property for compatibility
  timestamp: number;
}
