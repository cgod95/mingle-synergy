import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedDemoMatchesIfEmpty, Person } from "../lib/matchStore";
import { demoPeople } from "../lib/demoPeople";

type User = { id: string; name: string; email?: string } | null;
type Ctx = {
  user: User;
  isAuthenticated: boolean;
  login: (u: NonNullable<User>) => void;
  logout: () => void;
};

const Context = createContext<Ctx | null>(null);
const KEY = "mingle:user";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  // one-time load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = (u: NonNullable<User>) => {
    setUser(u);
    try { localStorage.setItem(KEY, JSON.stringify(u)); } catch {}
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(KEY); } catch {}
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout
  }), [user]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export function useAuth() {
  const c = useContext(Context);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
