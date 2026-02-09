// 🧠 Purpose: Protect routes requiring authentication and onboarding completion
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface RouteWrapperProps {
  children: React.ReactNode;
}

// Map onboarding step keys to their route paths
const STEP_TO_PATH: Record<string, string> = {
  profile: '/create-profile',
  photo: '/photo-upload',
  email: '/signin', // Email is handled via auth
};

/**
 * ProtectedRoute: Ensures user is authenticated and onboarding is complete
 * - If not authenticated -> redirect to /signin
 * - If onboarding incomplete -> redirect to next incomplete step
 * - If all checks pass -> render children
 */
const ProtectedRoute: React.FC<RouteWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isOnboardingComplete, getNextOnboardingStep, isLoading } = useOnboarding();
  const location = useLocation();

  // Show loading state while checking auth/onboarding
  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 flex items-center justify-center">
        <LoadingSpinner size="md" message="Loading..." />
      </div>
    );
  }

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  // Check onboarding completion
  // Only redirect if not on an onboarding page AND onboarding is incomplete
  if (!isOnboardingComplete) {
    const nextStep = getNextOnboardingStep();
    if (nextStep) {
      const redirectPath = STEP_TO_PATH[nextStep] || '/create-profile';
      // Don't redirect if already on an onboarding page
      const isOnOnboardingPage = 
        location.pathname.startsWith('/create-profile') || 
        location.pathname.startsWith('/photo-upload') || 
        location.pathname.startsWith('/upload');
      
      if (!isOnOnboardingPage) {
        return <Navigate to={redirectPath} replace />;
      }
    }
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

export default ProtectedRoute; 