import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';

export default function Logout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { resetOnboarding } = useOnboarding();

  useEffect(() => {
    async function doLogout() {
      await signOut();
      resetOnboarding();
      localStorage.clear();
      navigate('/signin', { replace: true });
    }
    doLogout();
  }, [signOut, resetOnboarding, navigate]);

  return <div className="p-8 text-center">Logging out...</div>;
} 