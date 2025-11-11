// 🧠 Purpose: Implement static Profile page to display current user info.

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Edit } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import BottomNav from '@/components/BottomNav';
import { logError } from '@/utils/errorHandler';
import { UserProfileSkeleton } from '@/components/ui/EnhancedLoadingStates';

export default function Profile() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{ displayName?: string; name?: string; bio?: string } | null>(null);
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
          const data: { displayName?: string; name?: string; bio?: string } = {};
          if (profile.displayName !== undefined) data.displayName = profile.displayName;
          if (profile.name !== undefined) data.name = profile.name;
          if (profile.bio !== undefined) data.bio = profile.bio;
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
      <div className="min-h-screen bg-neutral-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <UserProfileSkeleton />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-heading-1 mb-2">Profile</h1>
          <p className="text-body-secondary">Manage your account</p>
        </motion.div>

        <Card className="mb-6 border border-neutral-200 shadow-xl bg-white">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mb-6"
            >
              <Avatar className="h-32 w-32 mx-auto ring-4 ring-indigo-100 shadow-lg">
                <AvatarFallback className="bg-indigo-600 text-white text-4xl font-bold">
                  {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-neutral-800 mb-2">
              {profileData?.displayName || profileData?.name || currentUser.name || 'User'}
            </CardTitle>
            <p className="text-base text-neutral-600">{currentUser.email}</p>
            {profileData?.bio && (
              <p className="text-sm text-neutral-500 mt-2 italic">"{profileData.bio}"</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <Button
              onClick={() => navigate('/profile/edit')}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold shadow-md"
              variant="default"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/settings')}
              className="w-full h-12 border-2 border-neutral-300 hover:bg-neutral-50 text-base font-medium"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-base font-medium"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}