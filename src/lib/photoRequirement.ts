// Photo requirement check utility
// Per spec: STRICT_PHOTO_REQUIRED_FOR_CHECKIN (default: ON)
// User must have at least one photo to check in

import { FEATURE_FLAGS } from "./flags";

/**
 * Check if user has required photos for check-in
 * Returns true if photos are present OR if feature flag is disabled
 */
export function hasRequiredPhotos(photos: string[] | undefined | null): boolean {
  // If feature flag is disabled, allow check-in without photos
  if (!FEATURE_FLAGS.STRICT_PHOTO_REQUIRED_FOR_CHECKIN) {
    return true;
  }
  
  // Require at least one photo
  return Array.isArray(photos) && photos.length > 0;
}

/**
 * Get photo requirement message for UI
 */
export function getPhotoRequirementMessage(): string {
  return "Add one photo so people recognize you at the venue. It takes 10 seconds.";
}



