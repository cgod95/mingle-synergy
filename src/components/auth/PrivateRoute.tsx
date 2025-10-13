import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface PrivateRouteProps {
  children: React.ReactNode | (() => React.ReactNode);
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  const { userProfile, loading: profileLoading, needsPhotoUpload } = useUserProfile();
  const location = useLocation();
  
  // Show loading state while checking authentication and profile
  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to sign-in if not authenticated
  if (!currentUser) {
    return <Navigate to="/sign-in" replace />;
  }
  
  // Redirect to upload-photos if onboarding incomplete
  if (!isOnboardingComplete) {
    return <Navigate to="/upload-photos" replace />;
  }
  
  // Check if user needs photo upload for venue-related routes
  const isVenueRoute = location.pathname === '/venues' || location.pathname.startsWith('/venues/');
  
  if (isVenueRoute && needsPhotoUpload) {
    return <Navigate to="/upload-photos" replace state={{ 
      message: "Photo required to access venues and check in" 
    }} />;
  }
  
  return <>{typeof children === 'function' ? children() : children}</>;
};

export default PrivateRoute;
