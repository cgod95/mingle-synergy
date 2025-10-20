type Venue = { id: string; name: string; description?: string };

const KEY = "demo-liked-venues";

export function getLiked(): Venue[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function likeVenue(v: Venue) {
  const list = getLiked();
  if (!list.some(x => x.id === v.id)) {
    list.push(v);
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function unlikeVenue(id: string) {
  const list = getLiked().filter(v => v.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}
