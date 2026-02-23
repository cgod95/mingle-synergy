/**
 * Location Permission Utilities
 * Handles graceful degradation when location permission is denied
 */

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Check if location permission is granted
 */
export function hasLocationPermission(): boolean {
  if (!navigator.geolocation) {
    return false;
  }
  
  // Check localStorage for permission status
  const permissionGranted = localStorage.getItem('locationPermissionGranted');
  return permissionGranted === 'true';
}

/**
 * Check if location permission is denied
 */
export function isLocationDenied(): boolean {
  const permissionGranted = localStorage.getItem('locationPermissionGranted');
  return permissionGranted === 'false';
}

/**
 * Get location permission status
 */
export function getLocationPermissionStatus(): LocationPermissionStatus {
  if (!navigator.geolocation) {
    return 'unsupported';
  }
  
  const permissionGranted = localStorage.getItem('locationPermissionGranted');
  if (permissionGranted === 'true') {
    return 'granted';
  } else if (permissionGranted === 'false') {
    return 'denied';
  }
  
  return 'prompt';
}

/**
 * Check if user can browse venues (always true, even without location)
 */
export function canBrowseVenues(): boolean {
  return true; // Users can always browse venues
}

/**
 * Check if user can see people at venues (requires location)
 * Falls back to checking the browser Permissions API if localStorage flag is missing.
 */
export function canSeePeopleAtVenues(): boolean {
  if (hasLocationPermission()) return true;

  // If the flag was never set (null), don't block - the user may have
  // granted permission in a previous session or via the browser prompt.
  const stored = localStorage.getItem('locationPermissionGranted');
  if (stored === null) return true;

  return false;
}

/**
 * Check if user can check in to venues (requires location and must be within 500m)
 */
export function canCheckInToVenues(): boolean {
  return hasLocationPermission();
}

/**
 * Get explanation message for why location is needed
 */
export function getLocationExplanationMessage(): string {
  return "Location access is required to check in to venues and see people nearby. You can still browse venues without location access.";
}

/**
 * Check if Permissions-Policy allows geolocation
 */
function checkPermissionsPolicy(): boolean {
  // Check if Permissions-Policy API is available
  if (typeof document !== 'undefined' && 'featurePolicy' in document) {
    try {
      // @ts-expect-error - featurePolicy may not be in TypeScript types
      return document.featurePolicy.allowsFeature('geolocation');
    } catch (e) {
      // Feature Policy API not available, assume allowed
      return true;
    }
  }
  // If API not available, assume allowed (will fail at geolocation call if blocked)
  return true;
}

/**
 * Request location permission from the user
 * Returns true if permission granted, false otherwise
 */
export async function requestLocationPermission(): Promise<boolean> {
  // Check if geolocation API is available
  if (!navigator.geolocation) {
    console.warn('Geolocation API not supported in this browser');
    localStorage.setItem('locationPermissionGranted', 'false');
    return false;
  }

  // Check Permissions-Policy before attempting
  if (!checkPermissionsPolicy()) {
    console.error('Geolocation is blocked by Permissions-Policy. Please check server configuration.');
    localStorage.setItem('locationPermissionGranted', 'false');
    return false;
  }

  // Check if Permissions API is available for better error detection
  let permissionStatus: PermissionStatus | null = null;
  if ('permissions' in navigator && 'query' in navigator.permissions) {
    try {
      permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (permissionStatus.state === 'denied') {
        console.warn('Geolocation permission was previously denied by user');
        localStorage.setItem('locationPermissionGranted', 'false');
        return false;
      }
    } catch (e) {
      // Permissions API not available or geolocation not supported, continue with geolocation call
    }
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache location for 5 minutes to avoid repeated prompts
        }
      );
    });

    // Permission granted
    localStorage.setItem('locationPermissionGranted', 'true');
    localStorage.setItem('locationEnabled', 'true');
    
    // Store location coordinates
    if (position.coords) {
      localStorage.setItem('latitude', position.coords.latitude.toString());
      localStorage.setItem('longitude', position.coords.longitude.toString());
    }

    return true;
  } catch (error: any) {
    const errorMessage = error?.message || String(error || '');
    const errorCode = error?.code;
    
    // Handle permissions policy violations
    if (
      errorMessage.includes('permissions policy') || 
      errorMessage.includes('Permissions policy') ||
      errorMessage.includes('Permissions-Policy') ||
      errorMessage.includes('permission denied') && errorMessage.includes('policy')
    ) {
      console.error('Geolocation blocked by Permissions-Policy. The server configuration needs to allow geolocation=(self).');
      localStorage.setItem('locationPermissionGranted', 'false');
      return false;
    }
    
    // Handle specific error codes
    if (errorCode === 1) {
      // Permission denied by user - only this should revoke the flag
      console.warn('User denied geolocation permission');
      localStorage.setItem('locationPermissionGranted', 'false');
      return false;
    } else if (errorCode === 2) {
      // Position unavailable - device can't get a fix, but permission was granted
      console.warn('Geolocation position unavailable (permission still valid)');
      return false;
    } else if (errorCode === 3) {
      // Timeout - device too slow, but permission was granted
      console.warn('Geolocation request timed out (permission still valid)');
      return false;
    }
    
    // Other error - don't revoke permission for unknown errors
    console.error('Geolocation error:', error);
    return false;
  }
}

