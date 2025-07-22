// 🧠 Purpose: Display the current user's profile with clean, Hinge-style UI, responsive layout, and edit navigation

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-white">
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
        <div className="space-y-4 text-lg">
          <div>
            <span className="font-semibold">Email:</span>{' '}
            <span className="text-gray-700">{currentUser.email}</span>
          </div>
          {currentUser.displayName && (
            <div>
              <span className="font-semibold">Name:</span>{' '}
              <span className="text-gray-700">{currentUser.displayName}</span>
            </div>
          )}
        </div>
        <button
          className="mt-8 w-full py-3 bg-black text-white text-lg rounded-xl hover:bg-gray-900 transition"
          onClick={() => navigate('/profile-edit')}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;