/**
 * Rematch Tracking Utilities
 * Tracks rematch count per match to enforce 1 rematch limit
 */

const REMATCH_KEY_PREFIX = "mingle:rematch:";

/**
 * Get rematch count for a match
 */
export function getRematchCount(matchId: string): number {
  try {
    const count = localStorage.getItem(`${REMATCH_KEY_PREFIX}${matchId}`);
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Increment rematch count for a match
 */
export function incrementRematchCount(matchId: string): void {
  try {
    const current = getRematchCount(matchId);
    localStorage.setItem(`${REMATCH_KEY_PREFIX}${matchId}`, (current + 1).toString());
  } catch {
    // Ignore errors
  }
}

/**
 * Check if user can rematch (max 1 rematch allowed)
 */
export function canRematch(matchId: string): boolean {
  return getRematchCount(matchId) < 1;
}

/**
 * Check if user has already rematched
 */
export function hasRematched(matchId: string): boolean {
  return getRematchCount(matchId) >= 1;
}

/**
 * Reset rematch count (for testing/admin purposes)
 */
export function resetRematchCount(matchId: string): void {
  try {
    localStorage.removeItem(`${REMATCH_KEY_PREFIX}${matchId}`);
  } catch {
    // Ignore errors
  }
}

