// 🧠 Purpose: Provides user auth state and loading flag with added logging for stuck state debugging

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, getAuth, User, signOut } from 'firebase/auth';

const AuthContext = createContext<{
  currentUser: User | null;
  isLoading: boolean;
  hasPhoto: boolean;
  logout: () => Promise<void>;
}>({
  currentUser: null,
  isLoading: true,
  hasPhoto: false,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPhoto = Boolean(currentUser?.photoURL);

  const logout = async () => {
    await signOut(getAuth());
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, hasPhoto, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);

