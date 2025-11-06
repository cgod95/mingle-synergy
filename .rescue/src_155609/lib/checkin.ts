const KEY = "mingle:checkin"; // value: { venueId, venueName, ts }
export type Checkin = { venueId: string; venueName: string; ts: number };

export function setCheckin(v: { venueId: string; venueName: string }) {
  const data: Checkin = { ...v, ts: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(data));
  try { window.dispatchEvent(new Event("mingle:checkin")); } catch {}
  return data;
}
export function clearCheckin() {
  localStorage.removeItem(KEY);
  try { window.dispatchEvent(new Event("mingle:checkin")); } catch {}
}
export function getCheckin(): Checkin | null {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}
export function isCheckedInAt(venueId: string) {
  const c = getCheckin(); return !!(c && c.venueId === venueId);
}
