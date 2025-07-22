// /src/context/types/OnboardingContextType.ts

// 🧠 Purpose: Define step logic and state for onboarding flow

export interface OnboardingContextType {
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;

  nextStep: () => void;
  prevStep: () => void;
} 