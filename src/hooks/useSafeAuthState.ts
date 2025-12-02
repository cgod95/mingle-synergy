// 🧠 Purpose: Safe wrapper for useAuthState that handles null auth in demo mode
import { useState, useEffect } from 'react';
import { Auth, onAuthStateChanged } from 'firebase/auth';
import config from '@/config';

/**
 * Safe wrapper for useAuthState that handles null auth gracefully
 * Returns [null, false] when auth is null (demo mode)
 * Always calls the same number of hooks to maintain React rules
 */
export function useSafeAuthState(auth: Auth | null): [any, boolean] {
  // In demo mode, start with loading: false to prevent flash
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(!config.DEMO_MODE && !!auth);

  useEffect(() => {
    // If auth is null (demo mode), set loading to false immediately
    if (!auth || config.DEMO_MODE) {
      setLoading(false);
      return;
    }

    // Use Firebase's onAuthStateChanged directly instead of useAuthState hook
    // This avoids the null reference error
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return [user, loading];
}

