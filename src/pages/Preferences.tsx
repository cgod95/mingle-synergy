import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfile, updateUserProfile } from '@/services/firebase/userService';
import { Button } from '@/components/ui/button';

const Preferences: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [interestedIn, setInterestedIn] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser?.uid) return;

      const profile = await fetchUserProfile(currentUser.uid);
      if (profile?.ageRangePreference) {
        setMinAge(profile.ageRangePreference.min);
        setMaxAge(profile.ageRangePreference.max);
      }
      if (profile?.interestedIn) {
        setInterestedIn(profile.interestedIn);
      }
    };

    fetchPreferences();
  }, [currentUser]);

  const handleToggleInterest = (gender: string) => {
    setInterestedIn((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    await updateUserProfile(currentUser.uid, {
      ageRangePreference: { min: minAge, max: maxAge },
      interestedIn,
    });
    setLoading(false);
    navigate('/venues');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Set Your Preferences</h1>

        <label className="block mb-2 font-medium">Preferred Age Range</label>
        <div className="flex items-center gap-4 mb-6">
          <input
            type="number"
            min={18}
            max={maxAge}
            value={minAge}
            onChange={(e) => setMinAge(parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
          <span>-</span>
          <input
            type="number"
            min={minAge}
            max={100}
            value={maxAge}
            onChange={(e) => setMaxAge(parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <label className="block mb-2 font-medium">Interested In</label>
        <div className="flex gap-3 mb-6">
          {['male', 'female', 'non-binary'].map((gender) => (
            <button
              key={gender}
              onClick={() => handleToggleInterest(gender)}
              className={`px-4 py-2 rounded-full border ${
                interestedIn.includes(gender)
                  ? 'bg-coral-500 text-white border-coral-500'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {gender.charAt(0).toUpperCase() + gender.slice(1)}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-coral-500 text-white py-3 rounded-lg font-medium"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default Preferences;