import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const DEMO = import.meta.env.VITE_DEMO_MODE === "true";

type DemoUser = { uid: string; displayName?: string };
type Ctx = {
  user: User | DemoUser | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<Ctx>({
  user: null,
  loading: true,
  signOutUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Ctx["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO) {
      // Auto sign-in a fake user in demo mode
      const stored = localStorage.getItem("demo_user");
      const fake: DemoUser = stored
        ? JSON.parse(stored)
        : { uid: "demo-user", displayName: "Demo User" };
      localStorage.setItem("demo_user", JSON.stringify(fake));
      setUser(fake);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signOutUser = async () => {
    if (DEMO) {
      localStorage.removeItem("demo_user");
      setUser(null);
      return;
    }
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
