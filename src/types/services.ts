import { Match as AppMatch, User as AppUser } from '@/types';

// Service layer interfaces for abstraction and testing
export interface AuthService {
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  onAuthStateChanged: (callback: (user: User | null) => void) => () => void;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmailAndPassword: (email: string, password: string) => Promise<UserCredential>;
}

export interface UserService {
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  createUserProfile: (userId: string, data: UserProfile) => Promise<void>;
  getUserById: (userId: string) => Promise<UserProfile | null>;
  updateUser: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

// Define the Venue type directly in services.ts
export type Venue = {
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
};

export interface VenueService {
  getVenues: () => Promise<Venue[]>;
  getVenueById: (id: string) => Promise<Venue | null>;
  checkInToVenue: (userId: string, venueId: string) => Promise<void>;
  checkOutFromVenue: (userId: string) => Promise<void>;
  getNearbyVenues?: (latitude: number, longitude: number, radiusKm?: number) => Promise<Venue[]>;
  getVenuesByIds?: (venueIds: string[]) => Promise<Venue[]>;
  getAllVenues: () => Promise<Venue[]>;
}

// Define the Match type
export type Match = {
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
  metAt?: number | null;
};

export interface MatchService {
  getMatches: (userId: string) => Promise<Match[]>;
  createMatch: (matchData: Omit<Match, 'id'>) => Promise<Match>;
  updateMatch: (matchId: string, data: Partial<Match>) => Promise<void>;
  requestReconnect: (matchId: string, userId: string) => Promise<boolean>;
  markAsMet: (matchId: string) => Promise<boolean>;
}

// Firebase types for use in our services
export interface UserCredential {
  user: User;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// App-specific types that will be stored in Firestore
export interface UserProfile {
  id: string;
  name: string;
  photos: string[];
  bio?: string;
  isCheckedIn: boolean;
  currentVenue?: string;
  currentZone?: string;
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
  // Add verification fields
  isVerified?: boolean;
  pendingVerification?: boolean;
  lastVerificationAttempt?: number | null;
  verificationSelfie?: string;
  // Add occupation field
  occupation?: string;
}

// Add a VerificationService interface
export interface VerificationService {
  getVerificationStatus: (userId: string) => Promise<VerificationStatus>;
  submitVerification: (userId: string, selfieUrl: string) => Promise<boolean>;
  shouldRequestVerification: (userId: string) => Promise<boolean>;
}

export interface VerificationStatus {
  isVerified: boolean;
  pendingVerification: boolean;
  lastVerificationAttempt: number | null;
}
