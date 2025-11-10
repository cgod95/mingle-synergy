/**
 * Distance Check Utilities
 * Validates user is within 500m of venue before check-in
 */

import { calculateDistance } from './locationUtils';
import config from '@/config';

const CHECK_IN_DISTANCE_METERS = 500; // 500 meters = 0.5 km

/**
 * Check if user is within check-in distance (500m) of venue
 * In demo mode, always returns true (bypasses distance check)
 */
export async function isWithinCheckInDistance(
  venueLatitude: number,
  venueLongitude: number
): Promise<{ withinDistance: boolean; distanceMeters?: number; error?: string }> {
  // In demo mode, bypass distance check
  if (config.DEMO_MODE) {
    return {
      withinDistance: true,
      distanceMeters: 0
    };
  }

  if (!navigator.geolocation) {
    return {
      withinDistance: false,
      error: 'Geolocation not supported'
    };
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

    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    // Calculate distance in kilometers
    const distanceKm = calculateDistance(
      { latitude: userLat, longitude: userLng },
      { latitude: venueLatitude, longitude: venueLongitude }
    );

    // Convert to meters
    const distanceMeters = distanceKm * 1000;

    return {
      withinDistance: distanceMeters <= CHECK_IN_DISTANCE_METERS,
      distanceMeters: Math.round(distanceMeters)
    };
  } catch (error) {
    console.error('Error checking distance:', error);
    return {
      withinDistance: false,
      error: error instanceof Error ? error.message : 'Failed to get location'
    };
  }
}

/**
 * Get user-friendly distance message
 */
export function getDistanceMessage(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m away`;
  }
  return `${(distanceMeters / 1000).toFixed(1)}km away`;
}

/**
 * Get check-in error message based on distance
 */
export function getCheckInErrorMessage(distanceMeters: number): string {
  if (distanceMeters > CHECK_IN_DISTANCE_METERS) {
    return `You're ${getDistanceMessage(distanceMeters)}. You must be within ${CHECK_IN_DISTANCE_METERS}m to check in.`;
  }
  return 'Unable to check in. Please ensure location access is enabled.';
}

