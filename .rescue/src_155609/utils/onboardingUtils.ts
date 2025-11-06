// Onboarding utilities for reset and navigation
export const resetOnboarding = () => {
  localStorage.removeItem('onboardingComplete');
  localStorage.removeItem('onboardingSeen');
};

export const resetUserData = () => {
  localStorage.removeItem('checkedInVenueId');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userPreferences');
  // Keep other app settings intact
};

export const checkOnboardingCompletion = () => {
  const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
  return onboardingComplete;
};

export const getNextOnboardingStep = () => {
  const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
  
  if (!onboardingComplete) return '/create-profile';
  return '/venues';
};

// Helper to set onboarding as complete
export const setOnboardingComplete = (setIsOnboardingComplete?: (value: boolean) => void) => {
  if (setIsOnboardingComplete) {
    setIsOnboardingComplete(true);
  }
  localStorage.setItem('onboardingComplete', 'true');
};

// Get onboarding completion from context if available, else fallback to localStorage
export const isOnboardingFullyComplete = (contextValue?: boolean): boolean => {
  if (typeof contextValue === 'boolean') return contextValue;
  return checkOnboardingCompletion();
}; 

export const getStepFromPath = (path: string): number => {
  if (path.includes("upload-photos")) return 1;
  if (path.includes("preferences")) return 2;
  return 0;
};

export const getNextStepPath = (path: string): string => {
  const step = getStepFromPath(path);
  const steps = ["/create-profile", "/upload-photos", "/preferences", "/venues"];
  return steps[Math.min(step + 1, steps.length - 1)];
}; 