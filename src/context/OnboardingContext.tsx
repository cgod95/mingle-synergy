// 🧠 Purpose: Manages onboarding completion state and provides context for app-wide onboarding status

import React, { useState, useEffect, createContext, useContext } from "react";
import { OnboardingContext } from './OnboardingContext';

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

type OnboardingContextType = {
  onboardingProgress: OnboardingProgress;
  setOnboardingStepComplete: (step: keyof OnboardingProgress) => void;
  getNextOnboardingStep: () => keyof OnboardingProgress | null;
  isOnboardingComplete: boolean;
  resetOnboarding: () => void;
};

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress>(() => {
    const saved = localStorage.getItem('onboardingProgress');
    return saved ? JSON.parse(saved) : defaultProgress;
  });

  useEffect(() => {
    localStorage.setItem('onboardingProgress', JSON.stringify(onboardingProgress));
  }, [onboardingProgress]);

  // Listen for localStorage changes to sync onboarding state across tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'onboardingProgress' && event.newValue) {
        setOnboardingProgress(JSON.parse(event.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setOnboardingStepComplete = (step: keyof OnboardingProgress) => {
    setOnboardingProgress(prev => ({ ...prev, [step]: true }));
  };

  const getNextOnboardingStep = (): keyof OnboardingProgress | null => {
    for (const step of Object.keys(defaultProgress) as (keyof OnboardingProgress)[]) {
      if (!onboardingProgress[step]) return step;
    }
    return null;
  };

  const isOnboardingComplete = Object.values(onboardingProgress).every(Boolean) &&
    localStorage.getItem('onboardingComplete') === 'true' &&
    localStorage.getItem('profileComplete') === 'true';

  const resetOnboarding = () => {
    setOnboardingProgress(defaultProgress);
    localStorage.setItem('onboardingProgress', JSON.stringify(defaultProgress));
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