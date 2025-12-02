import { Match as AppMatch, User as AppUser } from '@/types';
import { FirestoreMatch } from '@/types/match';

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
  getUsersAtVenue: (venueId: string) => Promise<UserProfile[]>;
  getReconnectRequests: (userId: string) => Promise<string[]>;
  acceptReconnectRequest: (userId: string, requesterId: string) => Promise<void>;
  sendReconnectRequest: (fromUserId: string, toUserId: string) => Promise<void>;
  uploadProfilePhoto: (userId: string, file: File) => Promise<string>;
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
  specials?: Array<{ title: string; description: string }>;
};

export interface VenueService {
  listVenues: () => Promise<Venue[]>;
  getVenueById: (id: string) => Promise<Venue | null>;
  checkInToVenue: (userId: string, venueId: string) => Promise<void>;
  checkOutFromVenue: (userId: string) => Promise<void>;
  getNearbyVenues?: (latitude: number, longitude: number, radiusKm?: number) => Promise<Venue[]>;
  listVenuesByIds?: (venueIds: string[]) => Promise<Venue[]>;
  getAllVenues: () => Promise<Venue[]>;
  getUsersAtVenue: (venueId: string) => Promise<UserProfile[]>;
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

// Add the InterestService interface
export interface InterestService {
  expressInterest: (userId: string, targetUserId: string, venueId: string) => Promise<boolean>;
  getLikesRemaining: (userId: string, venueId: string) => Promise<number>;
  resetLikes: (userId: string, venueId: string) => Promise<boolean>;
  recordInterest?: (userId: string, targetUserId: string, venueId: string) => Promise<boolean>;
}

// Update the MatchService interface to match our implementation
export interface MatchService {
  getMatches: (userId: string) => Promise<FirestoreMatch[]>;
  createMatch: (user1Id: string, user2Id: string, venueId: string, venueName: string) => Promise<string>;
  sendMessage: (matchId: string, userId: string, message: string) => Promise<boolean>;
  calculateTimeRemaining: (expiresAt: Date) => string;
  requestReconnect?: (matchId: string, userId: string) => Promise<boolean>;
}

// Firebase types for use in our services
export interface UserCredential {
  user: User;
  uid?: string;
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
  uid?: string; // Firebase Auth UID
  name: string;
  displayName?: string; // Firebase Auth displayName
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
  matches: string[];
  likedUsers: string[];
  blockedUsers: string[];
  isVerified?: boolean;
  pendingVerification?: boolean;
  lastVerificationAttempt?: number | null;
  verificationSelfie?: string;
  occupation?: string;
  reconnectRequests?: string[];
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
