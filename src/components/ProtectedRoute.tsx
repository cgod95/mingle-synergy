/**
 * Purpose: Unified route protection for authenticated and onboarding-complete users.
 * Redirects to /sign-in if not authenticated, or /create-profile if onboarding is incomplete.
 * Prevents access to protected parts of the app like /venues and /profile.
 */

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();
  const { isOnboardingComplete } = useOnboarding();

  if (!currentUser) return <Navigate to="/sign-in" replace />;
  if (!isOnboardingComplete) return <Navigate to="/create-profile" replace />;

  return <>{children}</>;
} 