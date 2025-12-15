import { useState, useEffect, useCallback } from 'react';
import { 
  hasLocationPermission, 
  requestLocationPermission as requestPermission,
  getLocationPermissionStatus,
  LocationPermissionStatus
} from '@/utils/locationPermission';

/**
 * Centralized hook for location permission state management
 * Provides reactive state that updates across all components using it
 */
export function useLocationPermission() {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>(() => 
    getLocationPermissionStatus()
  );
  const [isRequesting, setIsRequesting] = useState(false);

  // Listen for storage changes (when permission is granted/denied in another tab/component)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'locationPermissionGranted' || e.key === 'locationEnabled') {
        setPermissionStatus(getLocationPermissionStatus());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (for same-tab updates)
    const interval = setInterval(() => {
      const currentStatus = getLocationPermissionStatus();
      if (currentStatus !== permissionStatus) {
        setPermissionStatus(currentStatus);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [permissionStatus]);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (isRequesting) return false;
    
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      // Update state immediately after permission is granted/denied
      setPermissionStatus(getLocationPermissionStatus());
      return granted;
    } catch (error) {
      setPermissionStatus(getLocationPermissionStatus());
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [isRequesting]);

  const hasPermission = permissionStatus === 'granted';

  return {
    permissionStatus,
    hasPermission,
    isRequesting,
    requestLocationPermission,
    refresh: () => setPermissionStatus(getLocationPermissionStatus())
  };
}

