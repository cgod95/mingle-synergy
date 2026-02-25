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
    <div className="flex flex-col items-center justify-start pt-[12vh] min-h-screen min-h-[100dvh] bg-neutral-900 px-4">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-violet-500 to-pink-500 bg-clip-text text-transparent">
        Create Your Profile
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-300">Name</label>
          <input
            className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl h-12 px-3"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-300">Age</label>
          <input
            className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl h-12 px-3"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-2xl transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default OnboardingProfile; 