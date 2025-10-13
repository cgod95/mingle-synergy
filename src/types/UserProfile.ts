import { FieldValue } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  interestedIn: ('male' | 'female' | 'non-binary' | 'other')[];
  bio: string;
  photos: string[];
  isCheckedIn: boolean;
  isVisible: boolean;
  interests: string[];
  ageRangePreference: {
    min: number;
    max: number;
  };
  matches: string[];
  likedUsers: string[];
  blockedUsers: string[];
  isOnboardingComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastActiveAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  venueId?: string;
  zoneName?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  subscriptionTier?: 'free' | 'premium' | 'vip';
  notificationSettings?: {
    push: boolean;
    email: boolean;
    matches: boolean;
    messages: boolean;
    venueUpdates: boolean;
  };
}