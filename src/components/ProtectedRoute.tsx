/**
 * Purpose: Unified route protection for authenticated and onboarding-complete users.
 * Redirects to /sign-in if not authenticated, or /create-profile if onboarding is incomplete.
 * Prevents access to protected parts of the app like /venues and /profile.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const location = useLocation();

  if (isLoading) return null;

  if (!currentUser) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (!isOnboardingComplete) {
    return <Navigate to="/create-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 