// /src/context/types/AuthContextType.ts

// 🧠 Purpose: Define all expected values returned from the Auth context

import { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null; // 👈 Fix: match current usage
  loading: boolean;  // 👈 Fix: match current usage
  signIn?: (email: string, password: string) => Promise<void>;
  signOut?: () => Promise<void>;
} 