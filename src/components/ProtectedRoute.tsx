// 🧠 Purpose: Allow navigation to protected routes if in demo mode (bypasses Firebase auth).
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';
import { useUser } from '../context/UserContext';
import config from '../config';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const { currentUser } = useUser();

  // If in demo mode, bypass Firebase auth and use UserContext
  if (config.DEMO_MODE) {
    if (currentUser) {
      return <>{children}</>;
    }
    return <Navigate to="/onboarding" replace />;
  }

  // Normal Firebase auth flow
  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;

  return <>{children}</>;
};

export default ProtectedRoute; 