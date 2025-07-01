import { createContext, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

type AuthContextType = {
  user: FirebaseUser | null;
  currentUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  sendPasswordResetEmail: async () => {},
});

export const useAuth = () => useContext(AuthContext); 