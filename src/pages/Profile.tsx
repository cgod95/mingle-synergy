
import React, { useState } from 'react';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { withAnalytics } from '@/components/withAnalytics';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { logUserAction } from '@/utils/errorHandler';
import usePerformance from '@/hooks/usePerformance';

const Profile = () => {
  usePerformance('ProfilePage');
  
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  
  // Mock profile data (replace with your actual data fetching)
  const profile = {
    name: 'Riley',
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'],
    bio: 'Enjoying life one day at a time. Love hiking, coffee, and good conversations.',
    age: 28,
    preferences: {
      interestedIn: ['everyone'],
      ageRange: { min: 21, max: 35 }
    },
    interests: ['Hiking', 'Coffee', 'Travel', 'Photography', 'Music']
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
        {/* Visibility Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">Visibility</h3>
              <p className="text-sm text-gray-500 mt-1">When toggled off, other users won't see you at venues</p>
            </div>
            <div className="ml-4">
              <button 
                onClick={toggleVisibility}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${isVisible ? 'bg-coral-500' : 'bg-gray-300'}`}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} 
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* Preferences Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-3">Preferences</h3>
          
          {/* Gender preferences */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">I'm interested in</label>
            <div className="flex flex-wrap gap-2">
              {['Men', 'Women', 'Everyone'].map(option => (
                <button
                  key={option}
                  className={`px-4 py-2 rounded-full text-sm ${
                    profile?.preferences?.interestedIn?.includes(option.toLowerCase()) 
                      ? 'bg-coral-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Age range - Fixed slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age range: {profile?.preferences?.ageRange?.min || 18} - {profile?.preferences?.ageRange?.max || 50}
            </label>
            <div className="relative pt-5 pb-2">
              <div className="h-1 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-1 bg-coral-500 rounded-full" 
                  style={{ 
                    left: `${((profile?.preferences?.ageRange?.min || 18) - 18) * 100 / 82}%`, 
                    right: `${100 - ((profile?.preferences?.ageRange?.max || 50) - 18) * 100 / 82}%` 
                  }}
                ></div>
              </div>
              <div 
                className="absolute w-5 h-5 bg-white border-2 border-coral-500 rounded-full -mt-2 transform -translate-x-1/2" 
                style={{ left: `${((profile?.preferences?.ageRange?.min || 18) - 18) * 100 / 82}%` }}
              ></div>
              <div 
                className="absolute w-5 h-5 bg-white border-2 border-coral-500 rounded-full -mt-2 transform -translate-x-1/2" 
                style={{ left: `${((profile?.preferences?.ageRange?.max || 50) - 18) * 100 / 82}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-3">About You</h3>
          
          {/* Profile photo */}
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {profile?.photos && profile.photos.length > 0 ? (
                <img 
                  src={profile.photos[0]} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  No Photo
                </div>
              )}
            </div>
            <div className="ml-4">
              <h4 className="font-medium">{profile?.name || 'Your Name'}</h4>
              <p className="text-sm text-gray-500">{profile?.age ? `${profile.age} years old` : ''}</p>
            </div>
          </div>
          
          {/* Bio */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
            <p className="text-gray-700">{profile?.bio || 'No bio added yet'}</p>
          </div>
          
          {/* Interests */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profile?.interests?.map((interest, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {interest}
                </span>
              )) || <p className="text-gray-500 italic">No interests added yet</p>}
            </div>
          </div>
        </div>
        
        {/* Edit profile button */}
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

export default withErrorBoundary(
  withAnalytics(Profile, 'Profile'),
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
