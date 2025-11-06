export type PersonLite = { id: string; name: string; photo?: string };

const LIKES_KEY = "mingle:likes";     // people YOU liked (ids)
const LIKED_BY_KEY = "mingle:likedBy"; // people who liked YOU (ids)
const MATCHES_KEY = "mingle:matches"; // mutual ids

function load(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function save(key: string, arr: string[]) {
  localStorage.setItem(key, JSON.stringify([...new Set(arr)]));
}

export function likePerson(p: PersonLite) {
  const mine = load(LIKES_KEY);
  if (!mine.includes(p.id)) {
    mine.push(p.id);
    save(LIKES_KEY, mine);
  }
  // if they already liked you -> match!
  const likedBy = load(LIKED_BY_KEY);
  if (likedBy.includes(p.id)) {
    const m = load(MATCHES_KEY);
    if (!m.includes(p.id)) {
      m.push(p.id);
      save(MATCHES_KEY, m);
    }
  }
}

export function seedLikedBy(ids: string[]) {
  const likedBy = load(LIKED_BY_KEY);
  save(LIKED_BY_KEY, [...likedBy, ...ids]);
}

export function getPendingLikes(): string[] {
  // people you liked but are NOT matched
  const mine = load(LIKES_KEY);
  const matches = load(MATCHES_KEY);
  return mine.filter(id => !matches.includes(id));
}

export function getMatches(): string[] {
  return load(MATCHES_KEY);
}

export function clearAllLikes() {
  localStorage.removeItem(LIKES_KEY);
  localStorage.removeItem(LIKED_BY_KEY);
  localStorage.removeItem(MATCHES_KEY);
}
