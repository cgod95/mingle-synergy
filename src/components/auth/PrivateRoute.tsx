
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppState } from '@/context/AppStateContext';

interface PrivateRouteProps {
  children: React.ReactNode | (() => React.ReactNode);
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppState();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // For development, bypass auth checks
  return <>{typeof children === 'function' ? children() : children}</>;
  
  // Uncomment for production:
  // if (!isAuthenticated) {
  //   return <Navigate to="/sign-in" replace />;
  // }
  // return <>{typeof children === 'function' ? children() : children}</>;
};

export default PrivateRoute;
