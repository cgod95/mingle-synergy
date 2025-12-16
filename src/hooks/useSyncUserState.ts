/**
 * Hook to sync user state from Firebase on app startup
 * Loads check-in status, matches, etc. from Firebase and updates local storage
 */

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import config from '@/config';
import { checkInAt, clearCheckIn } from '@/lib/checkinStore';
import { logError } from '@/utils/errorHandler';

export function useSyncUserState() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.uid || config.DEMO_MODE) return;

    const syncState = async () => {
      try {
        // Import services dynamically to avoid circular dependencies
        const { userService } = await import('@/services');
        
        // Get user profile from Firebase
        const profile = await userService.getUserProfile(currentUser.uid);
        
        if (profile) {
          // Sync check-in status
          if (profile.isCheckedIn && profile.currentVenue) {
            // User is checked in - update local storage
            checkInAt(profile.currentVenue);
          } else {
            // User is not checked in - clear local storage
            clearCheckIn();
          }
          
          // Store user profile data in localStorage for offline access
          try {
            localStorage.setItem('mingle:userProfile', JSON.stringify({
              id: profile.id,
              name: profile.name,
              photoURL: profile.photoURL || profile.photos?.[0],
              isCheckedIn: profile.isCheckedIn,
              currentVenue: profile.currentVenue,
              lastSynced: Date.now()
            }));
          } catch {
            // Non-critical
          }
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error('Failed to sync user state'), {
          context: 'useSyncUserState',
          userId: currentUser.uid
        });
      }
    };

    syncState();
  }, [currentUser?.uid]);
}

export default useSyncUserState;

