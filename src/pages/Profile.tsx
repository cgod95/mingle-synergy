// 🧠 Purpose: Implement static Profile page to display current user info.

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Edit, Camera } from 'lucide-react';
import { logError } from '@/utils/errorHandler';

export default function Profile() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{ displayName?: string; name?: string; bio?: string; photos?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile data from userService
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { userService } = await import('@/services');
        const profile = await userService.getUserProfile(currentUser.uid);
        if (profile) {
          // Filter out undefined values to satisfy exactOptionalPropertyTypes
          const data: { displayName?: string; name?: string; bio?: string; photos?: string[] } = {};
          if (profile.displayName !== undefined) data.displayName = profile.displayName;
          if (profile.name !== undefined) data.name = profile.name;
          if (profile.bio !== undefined) data.bio = profile.bio;
          if (profile.photos !== undefined) data.photos = profile.photos;
          setProfileData(data);
        }
      } catch (error) {
        logError(error as Error, { context: 'Profile.loadProfile', userId: currentUser?.uid || 'unknown' });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [currentUser]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <UserProfileSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {/* Profile Card — Hinge-style: how others see you */}
          <div className="relative rounded-2xl overflow-hidden bg-neutral-800">
            {/* Hero photo */}
            <div className="relative aspect-[3/4] max-h-[420px] overflow-hidden bg-neutral-700">
              {profileData?.photos && profileData.photos.length > 0 ? (
                <img 
                  src={profileData.photos[0]} 
                  alt={profileData?.displayName || profileData?.name || 'Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800">
                  <Camera className="w-16 h-16 text-neutral-500 mb-3" />
                  <p className="text-neutral-400 font-medium">Add a photo</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/photo-upload', { state: { from: 'profile' } })}
                    className="mt-2 text-indigo-400 hover:text-indigo-300"
                  >
                    Upload Photo
                  </Button>
                </div>
              )}
              {/* Name + age overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                <h1 className="text-2xl font-bold text-white">
                  {profileData?.displayName || profileData?.name || currentUser.name || 'User'}
                </h1>
              </div>
            </div>

            {/* Bio section */}
            <div className="p-5">
              {profileData?.bio ? (
                <p className="text-base text-neutral-300 leading-relaxed">{profileData.bio}</p>
              ) : (
                <button 
                  onClick={() => navigate('/profile/edit')}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  + Add a bio
                </button>
              )}
            </div>
          </div>

          {/* Additional photos */}
          {profileData?.photos && profileData.photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {profileData.photos.slice(1).map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/profile/edit')}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              variant="default"
              aria-label="Edit profile"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/photo-upload', { state: { from: 'profile' } })}
              className="w-full h-11 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-xl"
              aria-label="Edit photos"
            >
              <Camera className="w-4 h-4 mr-2" />
              Edit Photos
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="w-full h-11 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-xl"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full h-11 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}