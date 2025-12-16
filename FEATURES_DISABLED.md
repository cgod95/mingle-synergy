# Temporarily Disabled Features

This document tracks features that have been temporarily disabled for the beta release but may be re-enabled in the future.

## "I'm Here" Auto Check-In Button

- **Location:** `src/pages/CheckInPage.tsx` lines 271-346 (commented out)
- **Status:** Disabled for beta
- **Reason:** Feature not fully functional yet - needs proper distance calculation and venue matching logic
- **Description:** Auto-detects the nearest venue using geolocation and automatically checks the user in
- **To Re-enable:** 
  1. Uncomment the Card component in `CheckInPage.tsx`
  2. Implement proper haversine distance calculation
  3. Add venue matching logic to find closest venue within reasonable distance
  4. Test thoroughly with real-world location data
- **Future Improvements:**
  - Add distance threshold (e.g., only auto-check-in if within 50m of venue)
  - Show confirmation dialog before auto-check-in
  - Add analytics tracking for auto-check-in usage
  - Handle edge cases (multiple venues nearby, GPS accuracy issues)

