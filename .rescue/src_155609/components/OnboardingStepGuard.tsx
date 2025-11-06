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
  photos: '/upload-photos',
  preferences: '/preferences',
  verification: '/verification',
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
  const firstIncomplete = requiredSteps.find(step => 
    !onboardingProgress.steps?.[step]?.completed
  );
  
  if (firstIncomplete) {
    return <Navigate to={stepToPath[firstIncomplete]} replace />;
  }

  return <>{children}</>;
}; 