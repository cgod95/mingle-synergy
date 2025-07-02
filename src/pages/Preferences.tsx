import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';
import { mockUsers } from '@/data/mock';

const ageOptions = Array.from({ length: 83 }, (_, i) => i + 18); // ages 18–100
const genderOptions = ['Women', 'Men', 'Everyone'];

export default function Preferences() {
  const { currentUser } = useAuth();
  const { setOnboardingStepComplete } = useOnboarding();
  const navigate = useNavigate();
  const [minAge, setMinAge] = useState(25);
  const [maxAge, setMaxAge] = useState(35);
  const [genderPref, setGenderPref] = useState('Everyone');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser?.uid) return;

      // Find user in mock data
      const user = mockUsers.find(u => u.id === currentUser.uid);
      if (user?.ageRangePreference) {
        setMinAge(user.ageRangePreference.min);
        setMaxAge(user.ageRangePreference.max);
      }
      // Map existing interestedIn to new genderPref format
      if (user?.interestedIn) {
        if (user.interestedIn.includes('female') && user.interestedIn.includes('male')) {
          setGenderPref('Everyone');
        } else if (user.interestedIn.includes('female')) {
          setGenderPref('Women');
        } else if (user.interestedIn.includes('male')) {
          setGenderPref('Men');
        }
      }
    };

    fetchPreferences();
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSaving(true);
    
    // Convert genderPref back to interestedIn format for compatibility
    let interestedIn: ('male' | 'female' | 'non-binary' | 'other')[] = [];
    if (genderPref === 'Everyone') {
      interestedIn = ['male', 'female'];
    } else if (genderPref === 'Women') {
      interestedIn = ['female'];
    } else if (genderPref === 'Men') {
      interestedIn = ['male'];
    }

    // In a real app, this would update the user profile
    // For mock data, we'll just simulate the success
    console.log('Preferences updated:', {
      ageRangePreference: { min: minAge, max: maxAge },
      interestedIn,
    });
    
    setOnboardingStepComplete('preferences');
    navigate('/venues');
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col justify-between bg-white pb-20">
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-semibold text-center text-gray-900">Set your preferences</h1>
          <p className="text-center text-gray-600">You can update these anytime.</p>

          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Gender preference</span>
              <select
                className="w-full mt-1 border rounded-md px-3 py-2"
                value={genderPref}
                onChange={(e) => setGenderPref(e.target.value)}
              >
                {genderOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex space-x-4">
              <label className="flex-1">
                <span className="text-gray-700 font-medium">Min Age</span>
                <select
                  className="w-full mt-1 border rounded-md px-3 py-2"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                >
                  {ageOptions.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex-1">
                <span className="text-gray-700 font-medium">Max Age</span>
                <select
                  className="w-full mt-1 border rounded-md px-3 py-2"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                >
                  {ageOptions.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Finish Onboarding'}
          </button>
        </div>
      </div>
      <BottomNav />
    </Layout>
  );
}