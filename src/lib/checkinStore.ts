/**
 * Unified check-in store — single source of truth for venue check-in state.
 *
 * Stores:  { venueId, ts }  in localStorage under KEY.
 * Provides expiry helpers so ExpiryWarning and other consumers can
 * query remaining time, expiring-soon, and expired states.
 */

const KEY = "mingle:checkedVenueId";
const TS_KEY = "mingle:checkedVenueTs";

/** How long a check-in lasts (12 hours) */
export const CHECKIN_DURATION_MS = 12 * 60 * 60 * 1000;
/** Show "expiring soon" warning when less than 30 min remain */
export const CHECKIN_WARNING_MS = 30 * 60 * 1000;

// ── Zone helpers ──────────────────────────────────────────────

export function setCurrentZone(venueId: string, zone: string): void {
  try {
    localStorage.setItem(`mingle:zone:${venueId}`, zone);
  } catch {}
}

export function getCurrentZone(venueId: string): string | null {
  try {
    return localStorage.getItem(`mingle:zone:${venueId}`) || null;
  } catch {
    return null;
  }
}

// ── Core check-in state ───────────────────────────────────────

export function getCheckedVenueId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Timestamp (ms) at which the current check-in was created. 0 if none. */
export function getCheckInTimestamp(): number {
  try {
    const raw = localStorage.getItem(TS_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function checkInAt(venueId: string): void {
  try {
    localStorage.setItem(KEY, venueId);
    localStorage.setItem(TS_KEY, String(Date.now()));
    // Also write to the legacy mingle:checkin key so any old consumers stay in sync
    try {
      localStorage.setItem(
        "mingle:checkin",
        JSON.stringify({ venueId, venueName: venueId, ts: Date.now() })
      );
    } catch {}
    try {
      window.dispatchEvent(new Event("mingle:checkin"));
    } catch {}
  } catch {}
}

export function clearCheckIn(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(TS_KEY);
    localStorage.removeItem("mingle:checkin");
  } catch {}
  try {
    window.dispatchEvent(new Event("mingle:checkin"));
  } catch {}
}

export function isCheckedIn(venueId?: string | null): boolean {
  if (!venueId) return false;
  return getCheckedVenueId() === venueId;
}

// ── Expiry helpers (used by ExpiryWarning, etc.) ──────────────

/** Milliseconds remaining on the current check-in. 0 if none or expired. */
export function getRemainingCheckInTime(): number {
  const ts = getCheckInTimestamp();
  if (!ts) return 0;
  const elapsed = Date.now() - ts;
  const remaining = CHECKIN_DURATION_MS - elapsed;
  return remaining > 0 ? remaining : 0;
}

/** True when there's an active check-in with ≤ CHECKIN_WARNING_MS remaining. */
export function isCheckInExpiringSoon(): boolean {
  const remaining = getRemainingCheckInTime();
  return remaining > 0 && remaining <= CHECKIN_WARNING_MS;
}

/** True when the check-in timestamp exists but the duration has fully elapsed. */
export function isCheckInExpired(): boolean {
  const ts = getCheckInTimestamp();
  if (!ts) return false;
  return Date.now() - ts >= CHECKIN_DURATION_MS;
}
