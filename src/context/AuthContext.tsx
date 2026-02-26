import React, { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { seedDemoMatchesIfEmpty, Person } from "../lib/matchStore";
import { DEMO_PEOPLE } from "../lib/demoPeople";
import { authService } from "@/services";
import config from "@/config";
import { clearCheckIn } from "@/lib/checkinStore";

type User = { id: string; name: string; email?: string; uid?: string } | null;
type Ctx = {
  user: User;
  currentUser: User & { uid: string } | null; // Alias for compatibility
  isAuthenticated: boolean;
  login: (u: NonNullable<User>) => void;
  logout: () => void;
  signOut: () => void; // Alias for compatibility
  createDemoUser: () => void;
  signUpUser: (email: string, password: string) => Promise<void>;
  signInUser: (email: string, password: string) => Promise<void>;
};

const Context = createContext<Ctx | null>(null);
const KEY = "mingle:user";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  // Use ref to track user ID for stable comparison
  const userIdRef = useRef<string | null>(null);

  // one-time load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure uid exists for compatibility
        if (parsed && !parsed.uid) {
          parsed.uid = parsed.id;
        }
        setUser(parsed);
        userIdRef.current = parsed?.id || parsed?.uid || null;
      }
    } catch {}
  }, []);

  // Firebase auth state listener (only in Firebase mode)
  useEffect(() => {
    if (!config.DEMO_MODE && authService.onAuthStateChanged) {
      const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          const user: User = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || undefined,
          };
          setUser(user);
          userIdRef.current = user.id;
          try {
            localStorage.setItem(KEY, JSON.stringify(user));
          } catch {}
        } else {
          setUser(null);
          userIdRef.current = null;
          try {
            localStorage.removeItem(KEY);
          } catch {}
        }
      });
      return () => unsubscribe();
    }
    return undefined;
  }, []);

  const login = useCallback(async (u: NonNullable<User>) => {
    // Ensure uid exists for compatibility
    const userWithUid = { ...u, uid: u.uid || u.id };
    setUser(userWithUid);
    userIdRef.current = userWithUid.id || userWithUid.uid || null;
    try { localStorage.setItem(KEY, JSON.stringify(userWithUid)); } catch {}
    
    // Track user signed up event per spec section 9 (if new user)
    // Note: In a real app, you'd check if this is a new signup vs login
    try {
      const { trackUserSignedUp } = await import('../services/specAnalytics');
      trackUserSignedUp('demo'); // Default to 'demo' for demo mode
    } catch (error) {
      // Silently fail if analytics not available
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    userIdRef.current = null;
    try { localStorage.removeItem(KEY); } catch {}
    clearCheckIn();
  }, []);

  const createDemoUser = useCallback(() => {
    // Demo user creation disabled for closed beta - users must sign up with Firebase
    // This function is kept for compatibility but does nothing
    console.warn('Demo user creation is disabled. Please sign up to create an account.');
  }, []);

  const signUpUser = useCallback(async (email: string, password: string) => {
    try {
      if (config.DEMO_MODE) {
        // Demo mode: create user in localStorage
        // Check if user already exists
        const existingUser = localStorage.getItem(KEY);
        if (existingUser) {
          const parsed = JSON.parse(existingUser);
          if (parsed.email === email) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
        }

        const newUser: User = {
          id: `user_${Date.now()}`,
          uid: `user_${Date.now()}`,
          name: email.split('@')[0],
          email: email,
        };
        await login(newUser);
        localStorage.setItem('onboardingComplete', 'false');
      } else {
        // Firebase mode: use authService
        const credential = await authService.signUp(email, password);
        const firebaseUser: User = {
          id: credential.user.uid,
          uid: credential.user.uid,
          name: credential.user.displayName || email.split('@')[0],
          email: credential.user.email || email,
        };
        await login(firebaseUser);
        localStorage.setItem('onboardingComplete', 'false');
      }
    } catch (error: any) {
      // Re-throw with user-friendly message
      throw error;
    }
  }, [login]);

  const signInUser = useCallback(async (email: string, password: string) => {
    try {
      if (config.DEMO_MODE) {
        // Demo mode: simple check against localStorage
        const stored = localStorage.getItem(KEY);
        if (!stored) {
          throw new Error('No account found with this email. Please sign up instead.');
        }
        const parsed = JSON.parse(stored);
        if (parsed.email !== email) {
          throw new Error('No account found with this email. Please sign up instead.');
        }
        // In demo mode, we don't validate password - just log them in
        await login(parsed);
      } else {
        // Firebase mode: use authService
        const credential = await authService.signIn(email, password);
        const firebaseUser: User = {
          id: credential.user.uid,
          uid: credential.user.uid,
          name: credential.user.displayName || email.split('@')[0],
          email: credential.user.email || email,
        };
        await login(firebaseUser);
      }
    } catch (error: any) {
      throw error;
    }
  }, [login]);

  // Create stable currentUser reference - only recreate when user ID changes
  const currentUser = useMemo(() => {
    if (!user) return null;
    return { ...user, uid: user.uid || user.id };
  }, [user?.id, user?.uid]); // Only depend on ID/UID, not whole user object

  // CRITICAL: Memoize value based on user ID only, not whole objects
  // Don't include currentUser in dependencies since it's derived from user
  // This prevents re-renders when user object reference changes but ID stays the same
  const value = useMemo(() => ({
    user,
    currentUser,
    isAuthenticated: !!user,
    login,
    logout,
    signOut: logout, // Alias for compatibility
    createDemoUser,
    signUpUser,
    signInUser,
  }), [user?.id, user?.uid, login, logout, createDemoUser, signUpUser, signInUser]); // Only depend on user IDs, not currentUser (it's derived)

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export function useAuth() {
  const c = useContext(Context);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
