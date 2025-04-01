import React, { useState } from 'react';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { withAnalytics } from '@/components/withAnalytics';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { logUserAction } from '@/utils/errorHandler';
import usePerformance from '@/hooks/usePerformance';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff } from 'lucide-react';

const ProfilePage = () => {
  usePerformance('ProfilePage');
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const profile = {
    name: 'Riley',
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'],
    bio: 'Enjoying life one day at a time. Love hiking, coffee, and good conversations.',
    age: 28,
    preferences: {
      interestedIn: ['everyone'],
      ageRange: { min: 21, max: 35 },
    },
    interests: ['Hiking', 'Coffee', 'Travel', 'Photography', 'Music'],
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    logUserAction('toggle_profile_visibility', { visible: !isVisible });
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <Header />
      <div className="p-4 space-y-4">
        {/* Visibility */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {isVisible ? (
                <Eye className="w-5 h-5 text-coral-500 mr-3" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">Visibility</h3>
                <p className="text-sm text-gray-500 mt-1">
                  When toggled off, other users won't see you at venues
                </p>
              </div>
            </div>
            <Switch
              checked={isVisible}
              onCheckedChange={toggleVisibility}
              className="ml-4 data-[state=checked]:bg-coral-500"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-3">Preferences</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I'm interested in
            </label>
            <div className="flex flex-wrap gap-2">
              {['Men', 'Women', 'Everyone'].map((option) => (
                <button
                  key={option}
                  className={`px-4 py-2 rounded-full text-sm ${
                    profile.preferences.interestedIn.includes(option.toLowerCase())
                      ? 'bg-coral-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age range: {profile.preferences.ageRange.min} - {profile.preferences.ageRange.max}
            </label>
            <div className="py-4">
              <Slider
                defaultValue={[
                  profile.preferences.ageRange.min,
                  profile.preferences.ageRange.max,
                ]}
                min={18}
                max={100}
                step={1}
                className="mt-6"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-3">About You</h3>
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {profile.photos.length > 0 ? (
                <img
                  src={profile.photos[0]}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Photo
                </div>
              )}
            </div>
            <div className="ml-4">
              <h4 className="font-medium">{profile.name}</h4>
              <p className="text-sm text-gray-500">{profile.age} years old</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
            <p className="text-gray-700">{profile.bio}</p>
          </div>

          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          className="w-full py-3 bg-coral-500 text-white rounded-lg font-medium"
          onClick={handleEditProfile}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

// ✅ Fallback must return valid ReactNode
const FallbackComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">We couldn't load your profile right now.</p>
      <button 
        onClick={() => window.location.href = '/venues'}
        className="px-4 py-2 bg-[#3A86FF] text-white rounded-lg"
      >
        Go to Venues
      </button>
    </div>
  );
};

// ✅ Export a single default – no () after FallbackComponent!
const WrappedProfilePage = withErrorBoundary(
  withAnalytics(ProfilePage, 'Profile'),
  <FallbackComponent />
);

export default WrappedProfilePage;