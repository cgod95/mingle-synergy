/**
 * One-time cleanup script: removes stale check-ins and updates Scarlet Weasel image.
 * 
 * Run from the Firebase console or as a Cloud Function.
 * For now, this logic is embedded in the app as a one-time admin effect.
 * 
 * To run manually with firebase-admin:
 *   npx ts-node --esm scripts/cleanup-stale-checkins.ts
 */

// This script is meant to document the Firestore operations needed.
// The actual cleanup is done client-side in src/lib/adminCleanup.ts
// which runs once when an admin user loads the app.

console.log(`
=== Stale Check-in Cleanup ===

The following Firestore operations need to be performed:

1. For each user document where currentVenue is set:
   - If checkedInAt is older than 24 hours, set:
     currentVenue: null
     checkedInAt: null
     isVisible: false (or keep as-is)

2. Update venue document 'scarlet-weasel-redfern':
   - Set image field to the new Scarlet Weasel logo URL

These operations are now handled automatically:
- Client-side: usePeopleAtVenue filters out users with stale checkedInAt
- Client-side: getCheckedVenueId() auto-expires local check-ins after 24h
- Admin cleanup: src/lib/adminCleanup.ts runs once per admin session
`);
