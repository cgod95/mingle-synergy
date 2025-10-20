import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebase";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  signInDemo?: () => void;
  isDemo: boolean;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signOutUser: async () => {},
  isDemo: false,
});

function isDemoEnv() {
  const v = String(import.meta.env.VITE_DEMO_MODE ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDemo = isDemoEnv();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // load persisted demo auth
  useEffect(() => {
    if (isDemo) {
      const persisted = sessionStorage.getItem("demo-auth") === "1";
      if (persisted) {
        // @ts-expect-error minimal shape is fine for UI checks
        const fakeUser: User = { uid: "demo-user-1", displayName: "Demo User", email: "demo@example.com" };
        setUser(fakeUser);
      }
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [isDemo]);

  const signOutUser = async () => {
    if (isDemo) {
      sessionStorage.removeItem("demo-auth");
      setUser(null);
      return;
    }
    await signOut(auth);
    setUser(null);
  };

  const signInDemo = () => {
    if (!isDemo) return;
    // @ts-expect-error minimal shape is fine
    const fakeUser: User = { uid: "demo-user-1", displayName: "Demo User", email: "demo@example.com" };
    sessionStorage.setItem("demo-auth", "1");
    setUser(fakeUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser, signInDemo, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
