import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import userService from '@/services/firebase/userService';
import { UserProfile } from '@/types/services';

export const useUserProfile = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profile = await userService.getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const hasValidPhoto = () => {
    if (!userProfile) return false;

    const hasPhotos = userProfile.photos && userProfile.photos.length > 0;

    // Skipping photo upload counts as valid
    return hasPhotos || userProfile.skippedPhotoUpload === true;
  };

  const needsPhotoUpload = () => {
    if (!userProfile) return false;

    const hasPhotos = userProfile.photos && userProfile.photos.length > 0;

    // Need photo upload only if user neither uploaded nor explicitly skipped
    return !hasPhotos && userProfile.skippedPhotoUpload !== true;
  };

  return {
    userProfile,
    loading,
    error,
    hasValidPhoto: hasValidPhoto(),
    needsPhotoUpload: needsPhotoUpload()
  };
}; 