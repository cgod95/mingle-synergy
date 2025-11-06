const KEY = "mingle:checkedVenueId";

export function getCheckedVenueId(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function checkInAt(venueId: string): void {
  try { localStorage.setItem(KEY, venueId); } catch {}
}

export function clearCheckIn(): void {
  try { localStorage.removeItem(KEY); } catch {}
}

export function isCheckedIn(venueId?: string | null): boolean {
  if (!venueId) return false;
  return getCheckedVenueId() === venueId;
}
