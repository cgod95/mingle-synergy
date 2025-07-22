import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Logout() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut();
  }, [signOut]);

  return <div className="p-8 text-center">Logging out...</div>;
} 