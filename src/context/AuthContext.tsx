import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedDemoMatchesIfEmpty, Person } from "../lib/matchStore";
import { demoPeople } from "../lib/demoPeople";

type User = { id: string; name: string; email?: string; uid?: string } | null;
type Ctx = {
  user: User;
  currentUser: User & { uid: string } | null; // Alias for compatibility
  isAuthenticated: boolean;
  login: (u: NonNullable<User>) => void;
  logout: () => void;
  signOut: () => void; // Alias for compatibility
  createDemoUser: () => void;
};

const Context = createContext<Ctx | null>(null);
const KEY = "mingle:user";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

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
      }
    } catch {}
  }, []);

  const login = async (u: NonNullable<User>) => {
    // Ensure uid exists for compatibility
    const userWithUid = { ...u, uid: u.uid || u.id };
    setUser(userWithUid);
    try { localStorage.setItem(KEY, JSON.stringify(userWithUid)); } catch {}
    
    // Track user signed up event per spec section 9 (if new user)
    // Note: In a real app, you'd check if this is a new signup vs login
    try {
      const { trackUserSignedUp } = await import('../services/specAnalytics');
      trackUserSignedUp('demo'); // Default to 'demo' for demo mode
    } catch (error) {
      // Silently fail if analytics not available
    }
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(KEY); } catch {}
  };

  const createDemoUser = () => {
    const demoUser: User = {
      id: `demo_${Date.now()}`,
      uid: `demo_${Date.now()}`,
      name: 'Demo User',
      email: 'demo@mingle.app',
    };
    login(demoUser);
    // Mark as demo user
    try {
      localStorage.setItem('mingle:demo_user', 'true');
    } catch {}
  };

  const value = useMemo(() => ({
    user,
    currentUser: user ? { ...user, uid: user.uid || user.id } : null,
    isAuthenticated: !!user,
    login,
    logout,
    signOut: logout, // Alias for compatibility
    createDemoUser,
  }), [user]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export function useAuth() {
  const c = useContext(Context);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

    isAuthenticated: !!user,
    login,
    logout,
    signOut: logout, // Alias for compatibility
    createDemoUser,
  }), [user]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export function useAuth() {
  const c = useContext(Context);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
