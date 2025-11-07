const KEY = "mingle_likes_v1";

type Store = {
  mine: string[];    // ids I liked
  likedMe: string[]; // ids who liked me
  matches: string[]; // mutual ids
};

function coerceArr(x: unknown): string[] {
  return Array.isArray(x) ? x.filter(y => typeof y === "string") : [];
}
function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { mine: [], likedMe: [], matches: [] };
    const o = JSON.parse(raw);
    return { mine: coerceArr(o?.mine), likedMe: coerceArr(o?.likedMe), matches: coerceArr(o?.matches) };
  } catch {
    return { mine: [], likedMe: [], matches: [] };
  }
}
function save(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function resetLikesStore() { save({ mine: [], likedMe: [], matches: [] }); }

export function ensureDemoLikesSeed() {
  const s = load();
  if (!s.likedMe.length) {
    s.likedMe = ["chloe", "lucas"]; // they already like me so we can form matches
    save(s);
  }
}

/** Send a like. Returns true if mutual like (i.e., a match). */
export function likePerson(id: string): boolean {
  const s = load();
  if (!s.mine.includes(id)) s.mine.push(id);
  const mutual = s.likedMe.includes(id);
  if (mutual && !s.matches.includes(id)) s.matches.push(id);
  save(s);
  return mutual;
}

export function isMatched(id: string): boolean {
  return load().matches.includes(id);
}

export function isLiked(id: string): boolean {
  return load().mine.includes(id);
}

export function listMatches(): string[] {
  return load().matches;
}
