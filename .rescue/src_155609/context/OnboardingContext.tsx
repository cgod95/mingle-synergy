// 🧠 Purpose: Provides comprehensive onboarding context with Firebase sync.
// Handles per-step progress tracking and backend synchronization.

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import userService from '@/services/firebase/userService';
import onboardingService, { OnboardingProgress, OnboardingStepId, ONBOARDING_STEPS } from '@/services/firebase/onboardingService';
import { useAuth } from './AuthContext';

const ONBOARDING_PATHS = [
  "/create-profile",
  "/upload-photos",
  "/preferences"
];

interface OnboardingContextType {
  onboardingProgress: OnboardingProgress | null;
  isOnboardingComplete: boolean;
  setStepComplete: (step: OnboardingStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Load onboarding progress from Firebase when user changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let progress = await onboardingService.loadOnboardingProgress(currentUser.uid);
        
        if (!progress) {
          // Initialize onboarding for new user
          progress = await onboardingService.initializeOnboarding(currentUser.uid);
        }
        
        setOnboardingProgress(progress);
      } catch (error) {
        console.error('[OnboardingContext] Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [currentUser?.uid]);

  // Sync with user profile when onboarding is complete
  useEffect(() => {
    if (onboardingProgress?.isComplete && currentUser?.uid) {
      onboardingService.syncWithUserProfile(currentUser.uid);
    }
  }, [onboardingProgress?.isComplete, currentUser?.uid]);

  const isOnboardingComplete = onboardingProgress?.isComplete || false;

  const setStepComplete = async (step: OnboardingStepId) => {
    if (!currentUser?.uid) return;

    try {
      await onboardingService.completeStep(currentUser.uid, step);
      
      // Reload progress to get updated state
      const updatedProgress = await onboardingService.loadOnboardingProgress(currentUser.uid);
      setOnboardingProgress(updatedProgress);
    } catch (error) {
      console.error('[OnboardingContext] Error completing step:', error);
    }
  };

  const getCurrentStepIndex = () => {
    return ONBOARDING_PATHS.findIndex(path => location.pathname.startsWith(path));
  };

  const nextStep = async () => {
    const idx = getCurrentStepIndex();
    if (idx === -1) {
      navigate(ONBOARDING_PATHS[0]);
      return;
    }
    
    if (idx < ONBOARDING_PATHS.length - 1) {
      // Mark current step as complete before navigating
      const currentStep = ONBOARDING_STEPS[idx] as OnboardingStepId;
      await setStepComplete(currentStep);
      
      // Set current step in Firebase
      if (currentUser?.uid) {
        const nextStepId = ONBOARDING_STEPS[idx + 1] as OnboardingStepId;
        await onboardingService.setCurrentStep(currentUser.uid, nextStepId);
      }
      
      navigate(ONBOARDING_PATHS[idx + 1]);
    } else {
      // Complete final step and navigate to venues
      const currentStep = ONBOARDING_STEPS[idx] as OnboardingStepId;
      await setStepComplete(currentStep);
      navigate("/venues");
    }
  };

  const prevStep = () => {
    const idx = getCurrentStepIndex();
    if (idx > 0) {
      navigate(ONBOARDING_PATHS[idx - 1]);
    } else {
      navigate("/");
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingProgress,
        isOnboardingComplete,
        setStepComplete,
        nextStep,
        prevStep,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within an OnboardingProvider");
  return context;
}; 