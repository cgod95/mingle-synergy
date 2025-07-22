/**
 * Purpose: Handles the profile creation step in onboarding.
 * Saves user profile data to Firestore and navigates to the next step (/upload-photos).
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/firebase/userService';
import { getNextStepPath } from '@/utils/onboardingUtils';
import { useOnboarding } from '@/context/OnboardingContext';

const OnboardingProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setStepComplete } = useOnboarding();
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await userService.updateUserProfile(currentUser.uid, { name, age: Number(age) });
      await setStepComplete('profile');
      const nextPath = getNextStepPath(location.pathname);
      navigate(nextPath);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-2xl font-bold mb-6">Create Your Profile</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Age</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-black text-white py-2 rounded">
          Continue
        </button>
      </form>
    </div>
  );
};

export default OnboardingProfile; 