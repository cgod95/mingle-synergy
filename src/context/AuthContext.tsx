
import React, { createContext, useState, useEffect, useContext, ReactNode, useRef, useCallback } from 'react';
import { User } from '@/types/services';
import authService from '@/services';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Replace direct useNavigate with ref approach
  const location = useLocation();
  const navigateRef = useRef<ReturnType<typeof useNavigate>>();
  
  // Initialize navigate ref
  useEffect(() => {
    navigateRef.current = useNavigate();
  }, []);
  
  // Create a safe navigation function
  const safeNavigate = useCallback((path: string) => {
    if (navigateRef.current) {
      navigateRef.current(path);
    } else {
      console.warn('Navigation not available yet');
    }
  }, []);

  // Load user from localStorage on initial mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      setIsLoading(false);
    }
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        // Save user to localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await authService.auth.signIn(email, password);
      setCurrentUser(result.user);
      // Save user to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });
      
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      const profileComplete = localStorage.getItem('profileComplete') === 'true';
      
      if (!onboardingComplete) {
        safeNavigate('/onboarding');
      } else if (!profileComplete) {
        safeNavigate('/profile/edit');
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
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await authService.auth.signUp(email, password);
      setCurrentUser(result.user);
      // Save user to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      toast({
        title: 'Account created successfully',
        description: 'Welcome to Proximity!',
      });
      
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      const profileComplete = localStorage.getItem('profileComplete') === 'true';
      
      if (!onboardingComplete) {
        safeNavigate('/onboarding');
      } else if (!profileComplete) {
        safeNavigate('/profile/edit');
      } else {
        safeNavigate('/venues');
      }
    } catch (error) {
      toast({
        title: 'Sign up failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.auth.signOut();
      // Remove user from localStorage
      localStorage.removeItem('currentUser');
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

  const value = {
    currentUser,
    isLoading,
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
