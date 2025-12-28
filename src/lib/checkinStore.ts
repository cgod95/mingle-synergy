const KEY = "mingle:checkedVenueId";
const TIME_KEY = "mingle:checkInTime";

// Check-in expiry configuration (must match venueService.ts)
export const CHECKIN_EXPIRY_HOURS = 12;
export const CHECKIN_EXPIRY_MS = CHECKIN_EXPIRY_HOURS * 60 * 60 * 1000;
export const CHECKIN_WARNING_MS = 30 * 60 * 1000; // 30 minutes before expiry

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

export function getCheckedVenueId(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function getCheckInTime(): number | null {
  try {
    const time = localStorage.getItem(TIME_KEY);
    return time ? parseInt(time, 10) : null;
  } catch {
    return null;
  }
}

export function getCheckInExpiry(): number | null {
  const checkInTime = getCheckInTime();
  if (!checkInTime) return null;
  return checkInTime + CHECKIN_EXPIRY_MS;
}

export function getRemainingCheckInTime(): number {
  const expiry = getCheckInExpiry();
  if (!expiry) return 0;
  return Math.max(0, expiry - Date.now());
}

export function isCheckInExpired(): boolean {
  const remaining = getRemainingCheckInTime();
  return remaining <= 0 && getCheckedVenueId() !== null;
}

export function isCheckInExpiringSoon(): boolean {
  const remaining = getRemainingCheckInTime();
  return remaining > 0 && remaining <= CHECKIN_WARNING_MS;
}

export function checkInAt(venueId: string): void {
  try {
    localStorage.setItem(KEY, venueId);
    localStorage.setItem(TIME_KEY, Date.now().toString());
  } catch {}
}

export function clearCheckIn(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(TIME_KEY);
  } catch {}
}

export function isCheckedIn(venueId?: string | null): boolean {
  if (!venueId) return false;
  return getCheckedVenueId() === venueId;
}
