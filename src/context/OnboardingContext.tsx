// 🧠 Purpose: Manages onboarding completion state and provides context for app-wide onboarding status
// Migrated to use Firebase for production, localStorage fallback for demo mode

import React, { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import config from "../config";
import onboardingService, { OnboardingStepId } from "@/services/firebase/onboardingService";
import { logError } from "@/utils/errorHandler";

export type OnboardingProgress = {
  email: boolean;
  profile: boolean;
  photo: boolean;
};

const defaultProgress: OnboardingProgress = {
  email: false,
  profile: false,
  photo: false,
};

// Map Firebase step IDs to our simple boolean progress keys
const KEY_TO_STEP: Record<keyof OnboardingProgress, OnboardingStepId | null> = {
  email: null, // Email is handled separately (auth)
  profile: 'profile',
  photo: 'photos',
};

type OnboardingContextType = {
  onboardingProgress: OnboardingProgress;
  setOnboardingStepComplete: (step: keyof OnboardingProgress) => void;
  getNextOnboardingStep: () => keyof OnboardingProgress | null;
  isOnboardingComplete: boolean;
  resetOnboarding: () => void;
  isLoading: boolean;
  // Additional methods for compatibility
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (stepId: OnboardingStepId, stepData?: Record<string, unknown>) => Promise<void>;
  getCurrentStep: () => keyof OnboardingProgress | null;
  setStepComplete: (step: keyof OnboardingProgress) => void;
};

const OnboardingContext = createContext<OnboardingContextType>({
  onboardingProgress: defaultProgress,
  setOnboardingStepComplete: () => {},
  getNextOnboardingStep: () => null,
  isOnboardingComplete: false,
  resetOnboarding: () => {},
  isLoading: true,
  nextStep: () => {},
  prevStep: () => {},
  completeStep: async () => {},
  getCurrentStep: () => null,
  setStepComplete: () => {},
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
        };
        setOnboardingProgress(demoProgress);
        try {
          localStorage.setItem('onboardingProgress', JSON.stringify(demoProgress));
          localStorage.setItem('onboardingComplete', 'true');
          localStorage.setItem('profileComplete', 'true');
        } catch (error) {
          logError(error as Error, { source: 'OnboardingContext', action: 'saveDemoOnboarding' });
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
        };

        setOnboardingProgress(convertedProgress);
      } catch (error) {
        logError(error as Error, { source: 'OnboardingContext', action: 'loadFromFirebase' });
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
        // Non-critical localStorage error, silently continue
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
          // Non-critical storage event parse error
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setOnboardingStepComplete = async (step: keyof OnboardingProgress) => {
    // Prevent operations during loading
    if (isLoading) {
      return;
    }

    const updatedProgress = { ...onboardingProgress, [step]: true };
    setOnboardingProgress(updatedProgress);

    // Always save to localStorage first (for offline support and demo mode)
    try {
      localStorage.setItem('onboardingProgress', JSON.stringify(updatedProgress));
    } catch {
      // Continue even if localStorage fails - non-critical
    }

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
            try {
              await onboardingService.syncWithUserProfile(currentUser.uid);
            } catch (syncError) {
              // Non-critical sync error - localStorage already saved
              logError(syncError as Error, { source: 'OnboardingContext', action: 'syncWithUserProfile' });
            }
            // Mark as complete in localStorage to prevent redirect loops
            localStorage.setItem('onboardingComplete', 'true');
            localStorage.setItem('profileComplete', 'true');
          }
        } catch (error) {
          logError(error as Error, { source: 'OnboardingContext', action: 'saveStepToFirebase' });
          // Don't revert state - localStorage is already saved
          // Only revert if it's a critical error (not network/permission)
          const err = error as Error & { code?: string };
          const errorCode = err.code || '';
          const errorMessage = err.message || '';
          
          // Only revert for critical errors (not network/permission errors)
          if (!errorCode.includes('unavailable') && 
              !errorCode.includes('permission-denied') &&
              !errorMessage.includes('network') &&
              !errorMessage.includes('fetch')) {
            // Revert on critical error
            setOnboardingProgress(onboardingProgress);
          }
          // Re-throw so caller can handle (but localStorage is already saved)
          throw error;
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
          setHasRequiredData(hasPhotos);
        } else {
          setHasRequiredData(false);
        }
      } catch (error) {
        logError(error as Error, { source: 'OnboardingContext', action: 'checkRequiredData' });
        setHasRequiredData(null);
      }
    };

    checkRequiredData();
  }, [currentUser?.uid, isLoading]); // Only check when user changes or loading completes

  // Check if onboarding is complete
  // Allow completion if:
  // 1. All steps are marked complete in progress state
  // 2. Either hasRequiredData is true (or null/undefined - still checking), OR demo mode
  // 3. localStorage also indicates completion (for both demo and production)
  const isOnboardingComplete = Object.values(onboardingProgress).every(Boolean) &&
    (hasRequiredData === true || config.DEMO_MODE) &&
    (localStorage.getItem('onboardingComplete') === 'true' || config.DEMO_MODE);

  const resetOnboarding = async () => {
    setOnboardingProgress(defaultProgress);
    
    if (config.DEMO_MODE) {
      localStorage.setItem('onboardingProgress', JSON.stringify(defaultProgress));
    } else if (currentUser?.uid && !currentUser?.id?.startsWith('demo_')) {
      try {
        await onboardingService.resetOnboardingProgress(currentUser.uid);
      } catch (error) {
        logError(error as Error, { source: 'OnboardingContext', action: 'resetOnboarding' });
      }
    }
  };

  // Helper methods for compatibility
  const nextStep = () => {
    const next = getNextOnboardingStep();
    if (next) {
      setOnboardingStepComplete(next);
    }
  };

  const prevStep = () => {
    // Simple implementation - go back to previous incomplete step
    const steps: (keyof OnboardingProgress)[] = ['email', 'profile', 'photo'];
    const currentIndex = steps.findIndex(step => !onboardingProgress[step]);
    if (currentIndex > 0) {
      // Reset current step and previous step
      const prevStep = steps[currentIndex - 1];
      setOnboardingProgress(prev => ({ ...prev, [prevStep]: false }));
    }
  };

  const completeStep = async (stepId: OnboardingStepId, stepData?: Record<string, unknown>) => {
    if (!currentUser?.uid) return;
    try {
      await onboardingService.completeStep(currentUser.uid, stepId, stepData);
      // Map stepId back to progress key
      const stepKey = Object.entries(KEY_TO_STEP).find(([_, id]) => id === stepId)?.[0] as keyof OnboardingProgress | undefined;
      if (stepKey) {
        setOnboardingStepComplete(stepKey);
      }
    } catch (error) {
      logError(error as Error, { source: 'OnboardingContext', action: 'completeStep' });
    }
  };

  const getCurrentStep = () => {
    return getNextOnboardingStep();
  };

  const setStepComplete = setOnboardingStepComplete;

  const value: OnboardingContextType = {
    onboardingProgress,
    setOnboardingStepComplete,
    getNextOnboardingStep,
    isOnboardingComplete,
    resetOnboarding,
    isLoading,
    nextStep,
    prevStep,
    completeStep,
    getCurrentStep,
    setStepComplete,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
