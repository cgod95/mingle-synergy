/**
 * Purpose: Final onboarding step for selecting gender and age preferences.
 * Once submitted, it marks onboarding as complete and navigates to /venues.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/firebase/userService';
import { useOnboarding } from '@/context/OnboardingContext';

const Preferences: React.FC = () => {
  const { currentUser } = useAuth();
  const { setStepComplete } = useOnboarding();
  const navigate = useNavigate();

  const [preferredGender, setPreferredGender] = useState<'male' | 'female' | 'any' | ''>('');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 35]);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!preferredGender) {
      setError('Please select a gender preference.');
      return;
    }

    try {
      if (currentUser) {
        const interestedIn: ('male' | 'female' | 'non-binary' | 'other')[] = preferredGender === 'any' 
          ? ['male', 'female', 'non-binary', 'other']
          : [preferredGender as 'male' | 'female' | 'non-binary' | 'other'];
        await userService.updateUserProfile(currentUser.uid, {
          interestedIn,
          ageRangePreference: { min: ageRange[0], max: ageRange[1] },
        });
        await userService.markOnboardingComplete(currentUser.uid);
        setStepComplete('preferences');
        navigate('/venues');
      }
    } catch (err) {
      setError('An error occurred while saving preferences.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-4">Set Your Preferences</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Preferred Gender</label>
        <select
          value={preferredGender}
          onChange={(e) => setPreferredGender(e.target.value as 'male' | 'female' | 'any' | '')}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select...</option>
          <option value="female">Women</option>
          <option value="male">Men</option>
          <option value="any">Anyone</option>
        </select>
      </div>

      <div className="mb-6 w-full">
        <label className="block text-sm font-medium mb-1">Preferred Age Range</label>
        <input
          type="range"
          min="18"
          max="99"
          value={ageRange[1]}
          onChange={(e) => setAgeRange([18, parseInt(e.target.value)])}
          className="w-full"
        />
        <p className="text-center mt-2 text-sm text-gray-600">18 - {ageRange[1]}</p>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded-lg"
      >
        Continue
      </button>
    </div>
  );
};

export default Preferences; 