// Profile page - Modern hero photo layout, no bio

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Edit, Camera, ChevronRight, Sparkles, CheckCircle } from 'lucide-react';
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

  const displayName = profileData?.displayName || profileData?.name || currentUser?.name || 'User';
  const mainPhoto = profileData?.photos?.[0];
  const additionalPhotos = profileData?.photos?.slice(1) || [];

  // Calculate profile completeness
  const profileCompleteness = useMemo(() => {
    let score = 0;
    const checks = {
      hasName: !!displayName && displayName !== 'User',
      hasMainPhoto: !!mainPhoto,
      hasMultiplePhotos: (profileData?.photos?.length || 0) >= 2,
      // Bio removed - don't check it
    };
    
    if (checks.hasName) score += 40;
    if (checks.hasMainPhoto) score += 40;
    if (checks.hasMultiplePhotos) score += 20;
    
    return { score, checks };
  }, [displayName, mainPhoto, profileData?.photos?.length]);

  if (!currentUser) return null;

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

      {/* Profile Completeness Banner */}
      {profileCompleteness.score < 100 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 -mt-4 relative z-10"
        >
          <div className="bg-gradient-to-r from-[#7C3AED]/20 to-[#6D28D9]/10 border border-[#7C3AED]/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Profile {profileCompleteness.score}% complete</span>
                  <span className="text-xs text-[#A78BFA]">Get more matches!</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompleteness.score}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full"
                  />
                </div>
                {/* Tips */}
                <div className="space-y-1">
                  {!profileCompleteness.checks.hasMainPhoto && (
                    <button 
                      onClick={() => navigate('/photo-upload', { state: { from: 'profile' } })}
                      className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-[#A78BFA] transition-colors"
                    >
                      <div className="w-4 h-4 rounded-full border border-[#6B7280] flex items-center justify-center">
                        <span className="text-[8px]">+</span>
                      </div>
                      Add a profile photo
                    </button>
                  )}
                  {profileCompleteness.checks.hasMainPhoto && !profileCompleteness.checks.hasMultiplePhotos && (
                    <button 
                      onClick={() => navigate('/photo-upload', { state: { from: 'profile' } })}
                      className="flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-[#A78BFA] transition-colors"
                    >
                      <div className="w-4 h-4 rounded-full border border-[#6B7280] flex items-center justify-center">
                        <span className="text-[8px]">+</span>
                      </div>
                      Add more photos (2+ recommended)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Complete Profile Badge */}
      {profileCompleteness.score === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-4 -mt-4 relative z-10"
        >
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-400">Profile complete! You're all set.</span>
          </div>
        </motion.div>
      )}

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
