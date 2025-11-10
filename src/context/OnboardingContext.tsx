// 🧠 Purpose: Manages onboarding completion state and provides context for app-wide onboarding status
// Migrated to use Firebase for production, localStorage fallback for demo mode

import React, { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import config from "../config";
import onboardingService, { OnboardingStepId, ONBOARDING_STEPS } from "@/services/firebase/onboardingService";

export type OnboardingProgress = {
  email: boolean;
  profile: boolean;
  photo: boolean;
  preferences: boolean;
};

const defaultProgress: OnboardingProgress = {
  email: false,
  profile: false,
  photo: false,
  preferences: false,
};

// Map Firebase step IDs to our simple boolean progress keys
const STEP_TO_KEY: Record<OnboardingStepId, keyof OnboardingProgress> = {
  profile: 'profile',
  photos: 'photo',
  preferences: 'preferences',
  complete: 'preferences', // Complete means all steps done
};

const KEY_TO_STEP: Record<keyof OnboardingProgress, OnboardingStepId | null> = {
  email: null, // Email is handled separately (auth)
  profile: 'profile',
  photo: 'photos',
  preferences: 'preferences',
};

type OnboardingContextType = {
  onboardingProgress: OnboardingProgress;
  setOnboardingStepComplete: (step: keyof OnboardingProgress) => void;
  getNextOnboardingStep: () => keyof OnboardingProgress | null;
  isOnboardingComplete: boolean;
  resetOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextType>({
  onboardingProgress: defaultProgress,
  setOnboardingStepComplete: () => {},
  getNextOnboardingStep: () => null,
  isOnboardingComplete: false,
  resetOnboarding: () => {},
});

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding progress on mount and when user changes
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      
      // Demo mode: auto-complete all onboarding steps
      if (config.DEMO_MODE || !currentUser?.uid) {
        // In demo mode, auto-complete all steps for instant access
        const demoProgress: OnboardingProgress = {
          email: true,
          profile: true,
          photo: true,
          preferences: true,
        };
        setOnboardingProgress(demoProgress);
        try {
          localStorage.setItem('onboardingProgress', JSON.stringify(demoProgress));
          localStorage.setItem('onboardingComplete', 'true');
          localStorage.setItem('profileComplete', 'true');
        } catch (error) {
          console.error('Error saving demo onboarding:', error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Production mode: use Firebase
      try {
        let firebaseProgress = await onboardingService.loadOnboardingProgress(currentUser.uid);
        
        // Initialize if no progress exists
        if (!firebaseProgress) {
          firebaseProgress = await onboardingService.initializeOnboarding(currentUser.uid);
        }

        // Convert Firebase progress to our boolean format
        const convertedProgress: OnboardingProgress = {
          email: true, // Assume email is done if user is authenticated
          profile: firebaseProgress.steps?.profile?.completed || false,
          photo: firebaseProgress.steps?.photos?.completed || false,
          preferences: firebaseProgress.steps?.preferences?.completed || false,
        };

        setOnboardingProgress(convertedProgress);
      } catch (error) {
        console.error('Error loading onboarding from Firebase:', error);
        // Fallback to localStorage on error
        try {
          const saved = localStorage.getItem('onboardingProgress');
          if (saved) {
            setOnboardingProgress(JSON.parse(saved));
          }
        } catch {}
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [currentUser?.uid]);

  // Save to localStorage for demo mode
  useEffect(() => {
    if (config.DEMO_MODE || !currentUser?.uid) {
      try {
        localStorage.setItem('onboardingProgress', JSON.stringify(onboardingProgress));
      } catch (error) {
        console.error('Error saving onboarding to localStorage:', error);
      }
    }
  }, [onboardingProgress, currentUser?.uid]);

  // Listen for localStorage changes to sync onboarding state across tabs (demo mode)
  useEffect(() => {
    if (!config.DEMO_MODE) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'onboardingProgress' && event.newValue) {
        try {
          setOnboardingProgress(JSON.parse(event.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setOnboardingStepComplete = async (step: keyof OnboardingProgress) => {
    const updatedProgress = { ...onboardingProgress, [step]: true };
    setOnboardingProgress(updatedProgress);

    // Save to Firebase if in production mode
    if (!config.DEMO_MODE && currentUser?.uid) {
      const stepId = KEY_TO_STEP[step];
      if (stepId) {
        try {
          await onboardingService.completeStep(currentUser.uid, stepId);
          
          // Check if all steps are complete and sync with user profile
          const allComplete = Object.values(updatedProgress).every(Boolean);
          if (allComplete) {
            await onboardingService.syncWithUserProfile(currentUser.uid);
          }
        } catch (error) {
          console.error('Error saving step to Firebase:', error);
          // Revert on error
          setOnboardingProgress(onboardingProgress);
        }
      }
    }
  };

  const getNextOnboardingStep = (): keyof OnboardingProgress | null => {
    for (const step of Object.keys(defaultProgress) as (keyof OnboardingProgress)[]) {
      if (!onboardingProgress[step]) return step;
    }
    return null;
  };

  const isOnboardingComplete = Object.values(onboardingProgress).every(Boolean) &&
    (config.DEMO_MODE 
      ? localStorage.getItem('onboardingComplete') === 'true' && 
        localStorage.getItem('profileComplete') === 'true'
      : true); // In Firebase mode, we trust the progress state

  const resetOnboarding = async () => {
    setOnboardingProgress(defaultProgress);
    
    if (config.DEMO_MODE) {
      localStorage.setItem('onboardingProgress', JSON.stringify(defaultProgress));
    } else if (currentUser?.uid) {
      try {
        await onboardingService.resetOnboardingProgress(currentUser.uid);
      } catch (error) {
        console.error('Error resetting onboarding in Firebase:', error);
      }
    }
  };

  const value: OnboardingContextType = {
    onboardingProgress,
    setOnboardingStepComplete,
    getNextOnboardingStep,
    isOnboardingComplete,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
