// 🧠 Purpose: Implement static Profile page to display current user info.

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Edit, AlertCircle, Camera } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import BottomNav from '@/components/BottomNav';
import { logError } from '@/utils/errorHandler';
import { UserProfileSkeleton } from '@/components/ui/EnhancedLoadingStates';

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
      <div className="min-h-screen bg-neutral-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <UserProfileSkeleton />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Avatar and Name Section - Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-neutral-800 via-primary/5 to-neutral-800">
            <CardContent className="p-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="mb-4"
                >
                  <Avatar className="h-32 w-32 mx-auto ring-4 ring-primary/50 shadow-lg">
                    {profileData?.photos && profileData.photos.length > 0 ? (
                      <img 
                        src={profileData.photos[0]} 
                        alt={profileData?.displayName || profileData?.name || 'Profile'} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary text-white text-4xl font-bold">
                        {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {profileData?.displayName || profileData?.name || currentUser.name || 'User'}
                </h1>
                <p className="text-base text-neutral-400">{currentUser.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Photos Section - Card */}
          {profileData?.photos && profileData.photos.length > 0 && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-neutral-800 via-primary/5 to-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {profileData.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                      <img 
                        src={photo} 
                        alt={`Profile photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bio Section - Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-neutral-800 via-primary/5 to-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Bio</CardTitle>
            </CardHeader>
            <CardContent>
              {profileData?.bio ? (
                <p className="text-sm text-neutral-300">"{profileData.bio}"</p>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <p className="text-sm text-primary-foreground">Add a bio</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons - Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-neutral-800 via-primary/5 to-neutral-800">
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/profile/edit')}
                  className="w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 text-white text-base font-bold shadow-lg"
                  variant="default"
                  aria-label="Edit profile"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/photo-upload', { state: { from: 'profile' } })}
                  className="w-full h-12 text-neutral-300 hover:bg-primary/10 hover:text-white"
                  aria-label="Edit photos"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Edit Photo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/settings')}
                  className="w-full h-12 text-neutral-300 hover:bg-primary/10 hover:text-white"
                  aria-label="Open settings"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="w-full h-12 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}