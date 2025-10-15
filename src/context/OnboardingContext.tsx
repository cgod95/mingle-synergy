import React, { createContext, useContext, useState, ReactNode } from "react";

export interface OnboardingContextType {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboardingStep, setOnboardingStep] = useState(0);

  return (
    <OnboardingContext.Provider value={{ onboardingStep, setOnboardingStep }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
