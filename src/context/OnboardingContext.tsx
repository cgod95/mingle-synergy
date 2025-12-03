// 🧠 Purpose: Manages onboarding completion state and provides context for app-wide onboarding status
// Migrated to use Firebase for production, localStorage fallback for demo mode

import React, { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import config from "../config";
import onboardingService, { OnboardingStepId } from "@/services/firebase/onboardingService";

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
  isLoading: boolean;
};

const OnboardingContext = createContext<OnboardingContextType>({
  onboardingProgress: defaultProgress,
  setOnboardingStepComplete: () => {},
  getNextOnboardingStep: () => null,
  isOnboardingComplete: false,
  resetOnboarding: () => {},
  isLoading: true,
});

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const isInternalUpdate = React.useRef(false); // Prevent localStorage loop

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
        }
        setIsLoading(false);
        return;
      }

      // Production mode: use Firebase (skip if demo user)
      if (currentUser?.id?.startsWith('demo_')) {
        setIsLoading(false);
        return;
      }
      
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

  // Save to localStorage for demo mode - PREVENT LOOP
  useEffect(() => {
    // Skip if this update came from storage event (to prevent loop)
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    
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
      // Only handle events from OTHER tabs/windows, not this one
      if (event.key === 'onboardingProgress' && event.newValue) {
        try {
          isInternalUpdate.current = true; // Mark as internal update to prevent save loop
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

    // Save to Firebase if in production mode and not a demo user
    if (!config.DEMO_MODE && currentUser?.uid && !currentUser?.id?.startsWith('demo_')) {
      const stepId = KEY_TO_STEP[step];
      if (stepId) {
        try {
          // Don't pass stepData at all - let the service handle undefined properly
          await onboardingService.completeStep(currentUser.uid, stepId);
          
          // Check if all steps are complete and sync with user profile
          const allComplete = Object.values(updatedProgress).every(Boolean);
          if (allComplete) {
            await onboardingService.syncWithUserProfile(currentUser.uid);
            // Mark as complete in localStorage to prevent redirect loops
            localStorage.setItem('onboardingComplete', 'true');
            localStorage.setItem('profileComplete', 'true');
          }
        } catch (error) {
          console.error('Error saving step to Firebase:', error);
          // Revert on error
          setOnboardingProgress(onboardingProgress);
          throw error; // Re-throw so caller can handle
        }
      }
    } else {
      // Demo mode: also mark localStorage
      const allComplete = Object.values(updatedProgress).every(Boolean);
      if (allComplete) {
        localStorage.setItem('onboardingComplete', 'true');
        localStorage.setItem('profileComplete', 'true');
      }
    }
  };

  const getNextOnboardingStep = (): keyof OnboardingProgress | null => {
    for (const step of Object.keys(defaultProgress) as (keyof OnboardingProgress)[]) {
      if (!onboardingProgress[step]) return step;
    }
    return null;
  };

  // Enhanced completion check: verify actual data exists (photos + bio)
  const [hasRequiredData, setHasRequiredData] = React.useState<boolean | null>(null);
  
  // Check if user actually has photos and bio
  React.useEffect(() => {
    const checkRequiredData = async () => {
      if (config.DEMO_MODE || !currentUser?.uid) {
        setHasRequiredData(true); // Demo mode bypasses checks
        return;
      }
      
      // Skip check if still loading initial state
      if (isLoading) return;

      try {
        const { userService } = await import('@/services');
        const profile = await userService.getUserProfile(currentUser.uid);
        
        if (profile) {
          const hasPhotos = Array.isArray(profile.photos) && profile.photos.length > 0;
          const hasBio = !!profile.bio && profile.bio.trim().length >= 10;
          setHasRequiredData(hasPhotos && hasBio);
        } else {
          setHasRequiredData(false);
        }
      } catch (error) {
        console.error('Error checking required data:', error);
        setHasRequiredData(false);
      }
    };

    checkRequiredData();
  }, [currentUser?.uid, isLoading]); // Only check when user changes or loading completes

  const isOnboardingComplete = Object.values(onboardingProgress).every(Boolean) &&
    (hasRequiredData === true || config.DEMO_MODE) &&
    (config.DEMO_MODE 
      ? localStorage.getItem('onboardingComplete') === 'true' && 
        localStorage.getItem('profileComplete') === 'true'
      : true);

  const resetOnboarding = async () => {
    setOnboardingProgress(defaultProgress);
    
    if (config.DEMO_MODE) {
      localStorage.setItem('onboardingProgress', JSON.stringify(defaultProgress));
    } else if (currentUser?.uid && !currentUser?.id?.startsWith('demo_')) {
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
    isLoading,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
