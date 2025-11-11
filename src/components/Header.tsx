import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Header: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/signin');
  };

  if (!user) return null;

  return (
    <header className="w-full px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
      <div className="text-sm text-neutral-200">
        Signed in as {user.displayName || user.email}
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
