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
 */
export function canSeePeopleAtVenues(): boolean {
  return hasLocationPermission();
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
 * Request location permission from the user
 * Returns true if permission granted, false otherwise
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (!navigator.geolocation) {
    console.warn('Geolocation not supported');
    localStorage.setItem('locationPermissionGranted', 'false');
    return false;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
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
    console.error('Location permission denied:', error);
    localStorage.setItem('locationPermissionGranted', 'false');
    
    // Check if it was denied vs error
    if (error.code === 1) {
      // Permission denied
      return false;
    }
    
    // Other error (timeout, etc.)
    return false;
  }
}

