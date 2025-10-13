/**
 * Purpose: Handles the profile creation step in onboarding.
 * Saves user profile data to Firestore and navigates to the next step (/upload-photos).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import userService from '@/services/firebase/userService';
import { UserPlus } from 'lucide-react';

const OnboardingProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { setStepComplete } = useOnboarding();
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setError('');

    try {
      await userService.createUserProfile(currentUser.uid, {
        name,
        age: Number(age),
        bio,
        photos: [],
        interests: [],
        isCheckedIn: false,
        isVisible: true,
        matches: [],
        likedUsers: [],
        blockedUsers: [],
        ageRangePreference: { min: 18, max: 99 },
        gender: 'other',
        interestedIn: ['male', 'female', 'non-binary', 'other']
      });
      
      setStepComplete(0); // Profile step complete
      navigate('/upload-photos');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Profile creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mingle-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <UserPlus className="w-10 h-10 text-purple-500 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-mingle-text mb-2">Create Your Profile</h1>
          <p className="text-mingle-muted">Tell us about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-mingle-text mb-2">
              Name
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mingle-primary focus:border-transparent"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mingle-text mb-2">
              Age
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mingle-primary focus:border-transparent"
              type="number"
              min="18"
              max="99"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mingle-text mb-2">
              Bio
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mingle-primary focus:border-transparent resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className="text-xs text-mingle-muted mt-1">{bio.length}/500</p>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading || !name || !age}
          >
            {loading ? 'Creating Profile...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingProfile; 