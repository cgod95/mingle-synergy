import { ReactNode } from 'react';
import useRequireOnboarding from '@/hooks/useRequireOnboarding';

interface RequireOnboardingCompleteProps {
  children: ReactNode;
}

export const RequireOnboardingComplete = ({ children }: RequireOnboardingCompleteProps) => {
  useRequireOnboarding();
  
  return <>{children}</>;
}; 