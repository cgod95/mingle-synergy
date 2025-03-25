
// User related types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface UserCredential {
  user: User;
}

export interface UserProfile {
  id: string;
  name?: string;
  photos: string[];
  bio?: string;
  occupation?: string; // Added this property
  isCheckedIn?: boolean;
  currentVenue?: string;
  currentZone?: string;
  isVisible?: boolean;
  interests?: string[];
  gender?: string; // Changed from strict literal types to string
  interestedIn?: string[]; // Changed from strict literal types to string[]
  age?: number;
  ageRangePreference?: {
    min: number;
    max: number;
  };
  matches?: string[];
  likedUsers?: string[];
  blockedUsers?: string[];
  // Verification fields
  isVerified?: boolean;
  pendingVerification?: boolean;
  lastVerificationAttempt?: number | null;
  verificationSelfie?: string;
}

// Match related types
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  venueId: string;
  venueName?: string;
  timestamp: number;
  isActive: boolean;
  expiresAt: number;
  contactShared: boolean;
  userRequestedReconnect?: boolean;
  matchedUserRequestedReconnect?: boolean;
  reconnectRequestedAt?: number | null;
  reconnectedAt?: number | null;
  met?: boolean;
  metAt?: number;
  contactInfo?: {
    type: 'phone' | 'instagram' | 'snapchat' | 'custom';
    value: string;
    sharedBy: string;
    sharedAt: string; // Changed to string only, not string | number
  };
}

// Venue related types
export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  type: string;
  checkInCount: number;
  expiryTime: number;
  zones: string[];
  image: string;
  checkedInUsers: string[];
}

// Verification related types
export interface VerificationStatus {
  isVerified: boolean;
  pendingVerification: boolean;
  lastVerificationAttempt: number | null;
}

// Service interfaces
export interface AuthService {
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  onAuthStateChanged?: (callback: (user: User | null) => void) => () => void;
}

export interface UserService {
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  createUserProfile: (userId: string, data: UserProfile) => Promise<void>;
}

export interface VenueService {
  getVenues: () => Promise<Venue[]>;
  getVenueById: (id: string) => Promise<Venue | null>;
  checkInToVenue: (userId: string, venueId: string) => Promise<boolean>;
  checkOutFromVenue: (userId: string) => Promise<boolean>;
  getNearbyVenues?: (latitude: number, longitude: number, radiusKm?: number) => Promise<Venue[]>;
  getVenuesByIds?: (venueIds: string[]) => Promise<Venue[]>;
}

export interface MatchService {
  getMatches: (userId: string) => Promise<Match[]>;
  createMatch: (matchData: Omit<Match, 'id'>) => Promise<Match>;
  updateMatch: (matchId: string, data: Partial<Match>) => Promise<void>;
  requestReconnect?: (matchId: string, userId: string) => Promise<boolean>;
  markAsMet?: (matchId: string) => Promise<boolean>;
}

export interface VerificationService {
  submitVerification: (userId: string, selfieUrl: string) => Promise<boolean>;
  getVerificationStatus: (userId: string) => Promise<VerificationStatus>;
  shouldRequestVerification?: (userId: string) => Promise<boolean>;
}
