/**
 * Purpose: Final onboarding step for selecting gender and age preferences.
 * Once submitted, it marks onboarding as complete and navigates to /venues.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/firebase/userService';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';

const Preferences: React.FC = () => {
  const { currentUser } = useAuth();
  const { setStepComplete, completeOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const [preferredGender, setPreferredGender] = useState<'male' | 'female' | 'any' | ''>('');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 35]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!preferredGender) {
      setError('Please select a gender preference.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (currentUser) {
        const interestedIn: ('male' | 'female' | 'non-binary' | 'other')[] = preferredGender === 'any' 
          ? ['male', 'female', 'non-binary', 'other']
          : [preferredGender as 'male' | 'female' | 'non-binary' | 'other'];
        
        await userService.updateUserProfile(currentUser.uid, {
          interestedIn,
          ageRangePreference: { min: ageRange[0], max: ageRange[1] },
        });
        
        setStepComplete(2); // Preferences step complete
        await completeOnboarding();
        navigate('/venues');
      }
    } catch (err) {
      setError('An error occurred while saving preferences.');
      console.error('Preferences save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mingle-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mingle-text mb-2">Set Your Preferences</h1>
          <p className="text-mingle-muted">Help us find the right matches for you</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-mingle-text mb-3">
              I'm interested in
            </label>
            <select
              value={preferredGender}
              onChange={(e) => setPreferredGender(e.target.value as 'male' | 'female' | 'any' | '')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mingle-primary focus:border-transparent"
            >
              <option value="">Select your preference...</option>
              <option value="female">Women</option>
              <option value="male">Men</option>
              <option value="any">Anyone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-mingle-text mb-3">
              Age Range: 18 - {ageRange[1]}
            </label>
            <input
              type="range"
              min="18"
              max="99"
              value={ageRange[1]}
              onChange={(e) => setAgeRange([18, parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-mingle-muted mt-2">
              <span>18</span>
              <span>{ageRange[1]}</span>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            loading={loading}
            disabled={loading || !preferredGender}
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Preferences; 