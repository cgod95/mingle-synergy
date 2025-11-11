// 🧠 Purpose: Implement static Profile page to display current user info.

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Edit, Heart, MapPin, AlertCircle, Camera, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import BottomNav from '@/components/BottomNav';
import { logError } from '@/utils/errorHandler';
import { UserProfileSkeleton } from '@/components/ui/EnhancedLoadingStates';
import { getAllMatches } from '@/lib/matchesCompat';

export default function Profile() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<{ displayName?: string; name?: string; bio?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [venueCount, setVenueCount] = useState<number>(0);
  const [recentCheckIns, setRecentCheckIns] = useState<string[]>([]);

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
        
        // Load match count
        try {
          const matches = await getAllMatches(currentUser.uid);
          setMatchCount(matches.length);
        } catch (error) {
          // Non-critical
        }
        
        // Load venue count and recent check-ins from localStorage
        try {
          const checkedInVenues = JSON.parse(localStorage.getItem('checkedInVenues') || '[]');
          setVenueCount(checkedInVenues.length);
          setRecentCheckIns(checkedInVenues.slice(0, 3)); // Last 3 check-ins
        } catch (error) {
          // Non-critical
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
        <div className="mb-6">
          {/* Avatar and Name Section */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mb-6"
            >
              <Avatar className="h-32 w-32 mx-auto ring-4 ring-indigo-500/50 shadow-lg">
                <AvatarFallback className="bg-indigo-600 text-white text-4xl font-bold">
                  {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {profileData?.displayName || profileData?.name || currentUser.name || 'User'}
            </h1>
            <p className="text-base text-neutral-400">{currentUser.email}</p>
          </div>

          {/* Bio Section */}
          {profileData?.bio ? (
            <div className="text-center mb-6">
              <p className="text-sm text-neutral-300">"{profileData.bio}"</p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900/20 rounded-full">
                <AlertCircle className="w-4 h-4 text-indigo-400" />
                <p className="text-sm text-indigo-300">Add a bio</p>
              </div>
            </div>
          )}

          {/* Profile Completion */}
          {(() => {
            const hasName = !!(profileData?.displayName || profileData?.name || currentUser.name);
            const hasBio = !!profileData?.bio;
            const hasPhoto = true; // Assuming photo exists if user is logged in
            const completion = ((hasName ? 33 : 0) + (hasBio ? 33 : 0) + (hasPhoto ? 34 : 0));
            return (
              <div className="mb-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-300">Profile Completion</span>
                  <span className="text-sm font-bold text-indigo-400">{completion}%</span>
                </div>
                <Progress value={completion} className="h-2 bg-neutral-700" />
              </div>
            );
          })()}
          
          {/* Clickable Stats */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={() => navigate('/matches')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
              aria-label={`View ${matchCount} matches`}
            >
              <Heart className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-neutral-300">
                <span className="font-semibold text-white">{matchCount}</span> matches
              </span>
            </button>
            <div className="w-px h-6 bg-neutral-700" />
            <button
              onClick={() => navigate('/checkin')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
              aria-label={`View ${venueCount} venues`}
            >
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-neutral-300">
                <span className="font-semibold text-white">{venueCount}</span> venues
              </span>
            </button>
          </div>

          {/* Recent Activity */}
          {recentCheckIns.length > 0 && (
            <div className="mb-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="space-y-2">
                {recentCheckIns.map((venueId, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-400">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span>Checked in at venue {venueId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/profile/edit')}
              className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base font-bold shadow-lg"
              variant="default"
              aria-label="Edit profile"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/profile/edit')}
              className="w-full h-12 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              aria-label="Edit photos"
            >
              <Camera className="w-5 h-5 mr-2" />
              Edit Photo
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="w-full h-12 text-neutral-300 hover:bg-neutral-800 hover:text-white"
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
        </div>
      </div>
      <BottomNav />
    </div>
  );
}