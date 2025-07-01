import { createContext, useContext } from 'react';

type OnboardingProgress = {
  email: boolean;
  profile: boolean;
  photo: boolean;
  preferences: boolean;
};

type OnboardingContextType = {
  onboardingProgress: OnboardingProgress;
  setOnboardingStepComplete: (step: keyof OnboardingProgress) => void;
  getNextOnboardingStep: () => keyof OnboardingProgress | null;
  isOnboardingComplete: boolean;
  resetOnboarding: () => void;
};

export const OnboardingContext = createContext<OnboardingContextType>({
  onboardingProgress: { email: false, profile: false, photo: false, preferences: false },
  setOnboardingStepComplete: () => {},
  getNextOnboardingStep: () => null,
  isOnboardingComplete: false,
  resetOnboarding: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext); 