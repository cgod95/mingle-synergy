// 🧠 Purpose: Provides user auth state and loading flag with added logging for stuck state debugging

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from '../firebase';
import { useToast } from '../components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ReactNode, useRef, useCallback } from 'react';
import authService from '../services';
import { AuthContext } from './AuthContext';
import { AuthNavigationContext, useAuthNavigation } from './auth-context';

type AuthContextType = {
  user: FirebaseUser | null;
  currentUser: FirebaseUser | null; // Alias for user for backward compatibility
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const navigateRef = useRef<((path: string) => void) | null>(null);
  
  const setNavigate = useCallback((navigateFunction: (path: string) => void) => {
    navigateRef.current = navigateFunction;
  }, []);
  
  const safeNavigate = useCallback((path: string) => {
    if (navigateRef.current) {
      navigateRef.current(path);
    } else {
      console.warn('Navigation not available yet');
    }
  }, []);

  useEffect(() => {
    console.log("[AuthContext] Mounting...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AuthContext] Auth state changed:", firebaseUser);
      setUser(firebaseUser);
      setCurrentUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const localUser = localStorage.getItem('currentUser');
    if (!user && localUser) {
      try {
        setUser(JSON.parse(localUser));
        setCurrentUser(JSON.parse(localUser));
      } catch (e) {
        console.warn('Failed to parse stored user', e);
      }
    }
  }, [user]);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await authService.auth.signIn(email, password);
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });
      
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      const profileComplete = localStorage.getItem('profileComplete') === 'true';
      
      if (!profileComplete) {
        safeNavigate('/create-profile');
      } else if (!onboardingComplete) {
        safeNavigate('/onboarding');
      } else {
        safeNavigate('/venues');
      }
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const result = await authService.auth.signUp(email, password);
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      
      localStorage.setItem('pendingUserEmail', email);
      
      toast({
        title: 'Account created successfully',
        description: 'Welcome to Proximity!',
      });
      
      safeNavigate('/create-profile');
    } catch (error) {
      toast({
        title: 'Sign up failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.auth.signOut();
      localStorage.removeItem('currentUser');
      setUser(null);
      setCurrentUser(null);
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    } catch (error) {
      toast({
        title: 'Sign out failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    try {
      await authService.auth.sendPasswordResetEmail(email);
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link',
      });
    } catch (error) {
      toast({
        title: 'Failed to send password reset email',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const WithAuthNavigation: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const setNavigate = useContext(AuthNavigationContext);
  
  useEffect(() => {
    if (setNavigate) {
      setNavigate(navigate);
    }
  }, [navigate, setNavigate]);
  
  return <>{children}</>;
};
