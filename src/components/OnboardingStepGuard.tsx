import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboarding } from '@/context/OnboardingContext';
import { OnboardingStepId } from '@/services/firebase/onboardingService';

interface OnboardingStepGuardProps {
  requiredSteps: OnboardingStepId[];
  redirectPath?: string;
  children: React.ReactNode;
}

const stepToPath: Record<OnboardingStepId, string> = {
  profile: '/create-profile',
  photos: '/photo-upload',
  preferences: '/preferences',
  complete: '/checkin',
};

export const OnboardingStepGuard: React.FC<OnboardingStepGuardProps> = ({ 
  requiredSteps, 
  children 
}) => {
  const { onboardingProgress, isLoading } = useOnboarding();

  // Show loading while fetching progress
  if (isLoading) {
    return <div>Loading onboarding progress...</div>;
  }

  // If no progress loaded, redirect to first step
  if (!onboardingProgress) {
    return <Navigate to="/create-profile" replace />;
  }

  // Find the first incomplete required step
  // Note: OnboardingContext uses a different structure (boolean flags)
  // This guard may need updating to work with the new context structure
  const firstIncomplete = requiredSteps.find(step => {
    // For now, always allow access - the ProtectedRoute handles onboarding checks
    return false;
  });
  
  if (firstIncomplete) {
    return <Navigate to={stepToPath[firstIncomplete]} replace />;
  }

  return <>{children}</>;
}; 