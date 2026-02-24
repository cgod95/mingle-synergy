/**
 * Admin cleanup stub.
 *
 * Firestore security rules restrict users to only updating their own
 * documents, so bulk cleanup of other users' stale check-ins must be
 * done via a Cloud Function or the Firebase console.
 *
 * Client-side expiry is handled by:
 * - usePeopleAtVenue: filters out users with missing/stale checkedInAt
 * - getCheckedVenueId: auto-expires the current user's own check-in
 * - venueService: overrides venue images client-side
 */
export async function runAdminCleanup(): Promise<void> {
  // No-op: all expiry is handled client-side in the hooks/services above.
}
