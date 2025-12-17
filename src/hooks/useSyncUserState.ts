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
      // #region agent log
      console.log('[DEBUG:syncState:start]', {userId:currentUser.uid});
      fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSyncUserState.ts:syncState:start',message:'syncState starting',data:{userId:currentUser.uid},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Step 1: Import services with separate error handling
      let userService;
      try {
        // #region agent log
        console.log('[DEBUG:beforeImport]', 'About to import services');
        fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSyncUserState.ts:beforeImport',message:'About to import services',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const services = await import('@/services');
        // #region agent log
        console.log('[DEBUG:afterImport]', {hasUserService:!!services.userService,serviceKeys:Object.keys(services)});
        fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSyncUserState.ts:afterImport',message:'Services imported',data:{hasUserService:!!services.userService,serviceKeys:Object.keys(services)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        userService = services.userService;
      } catch (importError) {
        // #region agent log
        console.log('[DEBUG:importError]', {error:String(importError),stack:(importError as Error)?.stack?.substring(0,500)});
        fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSyncUserState.ts:importError',message:'Import failed',data:{error:String(importError),stack:(importError as Error)?.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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
        // #region agent log
        console.log('[DEBUG:beforeGetProfile]', {userId:currentUser.uid});
        fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSyncUserState.ts:beforeGetProfile',message:'About to call getUserProfile',data:{userId:currentUser.uid},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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


