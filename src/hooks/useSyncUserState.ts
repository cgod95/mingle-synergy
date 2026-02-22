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
      // Step 1: Import services with separate error handling
      let userService;
      try {
        const services = await import('@/services');
        userService = services.userService;
      } catch (importError) {
        console.error('[useSyncUserState] Failed to import services:', importError);
        return; // Exit early - can't proceed without services
      }
      
      // Step 2: Validate the service was loaded correctly
      if (!userService) {
        console.error('[useSyncUserState] userService is undefined after import');
        return;
      }
      
      // Step 3: Use the service with error handling
      try {
        // Get user profile from Firebase
        const profile = await userService.getUserProfile(currentUser.uid);
        
        if (profile) {
          // Sync check-in status
          if (profile.isCheckedIn && profile.currentVenue) {
            checkInAt(profile.currentVenue, currentUser.uid);
          } else {
            clearCheckIn(currentUser.uid);
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
            // Non-critical - localStorage might be full or unavailable
          }
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error('Failed to sync user state'), {
          context: 'useSyncUserState.profileFetch',
          userId: currentUser.uid
        });
      }
    };

    syncState();
  }, [currentUser?.uid]);
}

export default useSyncUserState;


