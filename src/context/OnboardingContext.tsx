// 🧠 Purpose: Provides comprehensive onboarding context with Firebase sync.
// Handles per-step progress tracking and backend synchronization.

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import userService from '@/services/firebase/userService';

interface OnboardingContextType {
  currentStep: number;
  isOnboardingComplete: boolean;
  nextStep: () => void;
  prevStep: () => void;
  setStepComplete: (step: number) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from Firebase when user changes
  useEffect(() => {
    const loadOnboardingState = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userProfile = await userService.getUserProfile(currentUser.uid);
        if (userProfile) {
          setIsOnboardingComplete(userProfile.isOnboardingComplete || false);
          // Set current step based on completed steps
          if (userProfile.name && userProfile.age) {
            setCompletedSteps(new Set([0])); // Profile step complete
            setCurrentStep(1);
          }
          if ((userProfile.photos && userProfile.photos.length > 0) || userProfile.skippedPhotoUpload) {
            setCompletedSteps(prev => new Set([...prev, 1])); // Photos step complete
            setCurrentStep(2);
          }
          if (userProfile.interests && userProfile.interests.length > 0) {
            setCompletedSteps(prev => new Set([...prev, 2])); // Preferences step complete
            setCurrentStep(3);
          }
          console.log('[OnboardingContext] Loaded userProfile:', userProfile);
          console.log('[OnboardingContext] isOnboardingComplete:', userProfile.isOnboardingComplete);
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, [currentUser]);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const setStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const completeOnboarding = async () => {
    if (!currentUser) return;
    
    try {
      await userService.markOnboardingComplete(currentUser.uid);
      setIsOnboardingComplete(true);
      localStorage.setItem('onboardingComplete', 'true');
      console.log('[OnboardingContext] Onboarding marked complete for user:', currentUser.uid);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = () => {
    setCurrentStep(0);
    setIsOnboardingComplete(false);
    setCompletedSteps(new Set());
    localStorage.removeItem('onboardingComplete');
  };

  const value: OnboardingContextType = {
    currentStep,
    isOnboardingComplete,
    nextStep,
    prevStep,
    setStepComplete,
    completeOnboarding,
    resetOnboarding,
    isLoading,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}; 