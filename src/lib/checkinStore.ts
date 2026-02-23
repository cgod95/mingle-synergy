/**
 * Unified check-in store — single source of truth for venue check-in state.
 *
 * Stores locally in localStorage AND persists to Firestore so other users
 * can see who is checked in at a venue in real time.
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { logError } from '@/utils/errorHandler';

const KEY = "mingle:checkedVenueId";
const TS_KEY = "mingle:checkedVenueTs";

/** How long a check-in lasts (24 hours) */
export const CHECKIN_DURATION_MS = 24 * 60 * 60 * 1000;
/** Show "expiring soon" warning when less than 30 min remain */
export const CHECKIN_WARNING_MS = 30 * 60 * 1000;

// ── Firestore sync ────────────────────────────────────────────

async function syncCheckInToFirestore(venueId: string | null, userId?: string): Promise<void> {
  if (!firestore || !userId) return;
  try {
    const userRef = doc(firestore, 'users', userId);
    if (venueId) {
      await updateDoc(userRef, {
        currentVenue: venueId,
        checkedInAt: serverTimestamp(),
        isVisible: true,
      });
    } else {
      await updateDoc(userRef, {
        currentVenue: null,
        checkedInAt: null,
      });
    }
  } catch (error) {
    logError(error as Error, { source: 'checkinStore', action: 'syncCheckInToFirestore', venueId: venueId || 'null' });
  }
}

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
    const venueId = localStorage.getItem(KEY);
    if (!venueId) return null;

    // Auto-expire: if the check-in is older than CHECKIN_DURATION_MS, clear it
    const ts = Number(localStorage.getItem(TS_KEY) || '0');
    if (ts && Date.now() - ts >= CHECKIN_DURATION_MS) {
      localStorage.removeItem(KEY);
      localStorage.removeItem(TS_KEY);
      localStorage.removeItem("mingle:checkin");
      return null;
    }

    return venueId;
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

/**
 * Check in at a venue. Persists locally and to Firestore.
 * Pass userId to sync to Firestore so other users can see you.
 */
export function checkInAt(venueId: string, userId?: string): void {
  try {
    localStorage.setItem(KEY, venueId);
    localStorage.setItem(TS_KEY, String(Date.now()));
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
  syncCheckInToFirestore(venueId, userId);
}

/**
 * Clear check-in. Pass userId to sync removal to Firestore.
 */
export function clearCheckIn(userId?: string): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(TS_KEY);
    localStorage.removeItem("mingle:checkin");
  } catch {}
  try {
    window.dispatchEvent(new Event("mingle:checkin"));
  } catch {}
  syncCheckInToFirestore(null, userId);
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
