// 🧠 Purpose: Protect routes requiring authentication and onboarding completion
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';
import { useUser } from '../context/UserContext';
import { useOnboarding } from '../context/OnboardingContext';
import config from '../config';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  const { isOnboardingComplete, getNextOnboardingStep } = useOnboarding();

  // If in demo mode, bypass Firebase auth and use UserContext
  if (config.DEMO_MODE) {
    if (!currentUser) {
      return <Navigate to="/" replace />;
    }
    
    // In demo mode, bypass all onboarding checks - grant full access immediately
    // Demo users get instant access to all features
    return <>{children}</>;
  }

  // Normal Firebase auth flow - only use Firebase hooks if not in demo mode
  const [user, loading] = useAuthState(auth || null);
  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  
  // Check onboarding completion for Firebase users
  if (!isOnboardingComplete) {
    const nextStep = getNextOnboardingStep();
    if (nextStep) {
      const stepRoutes: Record<string, string> = {
        email: '/signin',
        profile: '/create-profile',
        photo: '/photo-upload',
        preferences: '/preferences',
      };
      const redirectPath = stepRoutes[nextStep] || '/onboarding';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 