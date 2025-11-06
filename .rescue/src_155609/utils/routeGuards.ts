
/**
 * Route guard to check if user has completed onboarding and profile setup
 */
export const requireOnboarding = (to: string): string => {
  const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
  const profileComplete = localStorage.getItem('profileComplete') === 'true';
  
  if (!onboardingComplete) {
    return '/onboarding';
  } else if (!profileComplete) {
    return '/profile/edit';
  }
  
  return to;
};
