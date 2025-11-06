// /src/types/context.ts

import { User } from './index';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null; // ✅ Fix: Add this
}

export interface OnboardingContextType {
  isOnboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  nextStep: () => void;        // ✅ Fix: Add this
  prevStep: () => void;        // ✅ Fix: Add this
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  age?: number;
  gender?: string;
  preferences?: { gender?: string; ageRange?: [number, number] };
  skippedPhotoUpload?: boolean;
  isOnboardingComplete: boolean; // ✅ Fix: Add this
} 