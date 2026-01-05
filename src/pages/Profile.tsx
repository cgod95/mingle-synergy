// Profile page - Modern hero photo layout, no bio

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Edit, Camera, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { logError } from '@/utils/errorHandler';

export default function Profile() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{ displayName?: string; name?: string; photos?: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

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
          const data: { displayName?: string; name?: string; photos?: string[] } = {};
          if (profile.displayName !== undefined) data.displayName = profile.displayName;
          if (profile.name !== undefined) data.name = profile.name;
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

  const displayName = profileData?.displayName || profileData?.name || currentUser.name || 'User';
  const mainPhoto = profileData?.photos?.[0];
  const additionalPhotos = profileData?.photos?.slice(1) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pb-20">
        <div className="animate-pulse">
          <div className="aspect-[3/4] max-h-[60vh] bg-[#1a1a24]" />
          <div className="p-4 space-y-4">
            <div className="h-8 bg-[#1a1a24] rounded-lg w-32" />
            <div className="h-12 bg-[#1a1a24] rounded-xl" />
            <div className="h-12 bg-[#1a1a24] rounded-xl" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20">
      {/* Hero Photo */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative aspect-[3/4] max-h-[60vh] overflow-hidden"
      >
        {mainPhoto ? (
          <img 
            src={mainPhoto} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center">
            <span className="text-8xl font-bold text-white/80">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white">
            {displayName}
          </h1>
        </div>

        {/* Edit photo button */}
        <button
          onClick={() => navigate('/photo-upload', { state: { from: 'profile' } })}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <Camera className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Additional Photos */}
      {additionalPhotos.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {additionalPhotos.map((photo, index) => (
              <div 
                key={index}
                className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-[#2D2D3A]"
              >
                <img 
                  src={photo} 
                  alt={`Photo ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <button
              onClick={() => navigate('/photo-upload', { state: { from: 'profile' } })}
              className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-dashed border-[#2D2D3A] flex items-center justify-center text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 space-y-2">
        {/* Edit Profile */}
        <button
          onClick={() => navigate('/profile/edit')}
          className="w-full flex items-center justify-between p-4 bg-[#111118] rounded-2xl border border-[#2D2D3A] hover:border-[#7C3AED]/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-white">Edit Profile</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#7C3AED] transition-colors" />
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center justify-between p-4 bg-[#111118] rounded-2xl border border-[#2D2D3A] hover:border-[#7C3AED]/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a24] flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#9CA3AF]" />
            </div>
            <span className="font-medium text-white">Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#7C3AED] transition-colors" />
        </button>

        {/* Sign Out */}
        <button
          onClick={signOut}
          className="w-full flex items-center justify-between p-4 bg-[#111118] rounded-2xl border border-[#2D2D3A] hover:border-red-500/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="font-medium text-red-400">Sign Out</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-red-400 transition-colors" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
