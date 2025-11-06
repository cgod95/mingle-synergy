import { createContext, useContext } from 'react';

export const AuthNavigationContext = createContext<((navigate: (path: string) => void) => void) | undefined>(undefined);

export const useAuthNavigation = () => {
  const context = useContext(AuthNavigationContext);
  if (!context) {
    throw new Error('useAuthNavigation must be used within an AuthProvider');
  }
  return context;
}; 