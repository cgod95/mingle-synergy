import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import config from '@/config';
import { useUser } from '../context/UserContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();
  
  // In demo mode, use UserContext instead of Firebase
  const [firebaseUser] = useAuthState(auth || null);
  const user = config.DEMO_MODE ? currentUser : firebaseUser;

  const handleSignOut = async () => {
    if (config.DEMO_MODE) {
      setCurrentUser(null);
    } else if (auth) {
      await auth.signOut();
    }
    navigate('/signin');
  };

  if (!user) return null;

  // Handle both Firebase User and app User types
  const displayName = config.DEMO_MODE 
    ? (user as any).name || 'Demo User'
    : (user as any).displayName || (user as any).email || 'User';

  return (
    <header className="w-full px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
      <div className="text-sm text-neutral-200">
        Signed in as {displayName}
      </div>
      <div className="flex space-x-4 items-center">
        <Link to="/venues" className="text-blue-500 hover:underline">Venues</Link>
        <Link to="/profile" className="text-blue-500 hover:underline">Profile</Link>
        <button onClick={handleSignOut} className="text-red-500 hover:underline">
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
