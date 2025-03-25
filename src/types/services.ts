
export interface AuthService {
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
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
  gender?: string;
  interestedIn?: string[];
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

export interface UserService {
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  createUserProfile: (userId: string, data: UserProfile) => Promise<void>;
}

export interface VenueService {
  getVenues: () => Promise<any[]>;
  getVenueById: (id: string) => Promise<any>;
  checkInToVenue: (userId: string, venueId: string) => Promise<boolean>;
  checkOutFromVenue: (userId: string) => Promise<boolean>;
}

export interface MatchService {
  getMatches: (userId: string) => Promise<any[]>;
  createMatch: (userId1: string, userId2: string, venueId: string) => Promise<any>;
  shareContact: (matchId: string, contactInfo: any) => Promise<boolean>;
}

export interface VerificationService {
  submitVerification: (userId: string, selfieUrl: string) => Promise<boolean>;
  getVerificationStatus: (userId: string) => Promise<string>;
}
