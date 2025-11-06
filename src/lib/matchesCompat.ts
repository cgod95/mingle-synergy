import { listMatches } from "./likesStore";

// 3 hours in seconds
const DURATION = 3 * 60 * 60;
const META_KEY = "mingle_matches_meta_v1";

type Meta = Record<string, number>; // id -> epoch ms when the match started

function getMeta(): Meta {
  try {
    const s = localStorage.getItem(META_KEY);
    return s ? (JSON.parse(s) as Meta) : {};
  } catch {
    return {};
  }
}
function setMeta(m: Meta) {
  try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch {}
}

/** Return list of active match IDs (delegates to likesStore). */
export function getActiveMatches(): string[] {
  try {
    return listMatches() || [];
  } catch {
    return [];
  }
}

/**
 * Ensure a match has a start timestamp. If missing, initialize now
 * so the user gets a fresh 3h window in demo/local mode.
 */
function ensureStartedAt(id: string): number {
  const meta = getMeta();
  if (!meta[id]) {
    meta[id] = Date.now();
    setMeta(meta);
  }
  return meta[id];
}

/** Remaining seconds until the 3h window expires (never negative). */
export function getRemainingSeconds(id: string): number {
  const started = ensureStartedAt(id);          // epoch ms
  const elapsed = Math.floor((Date.now() - started) / 1000);
  const remaining = DURATION - elapsed;
  return remaining > 0 ? remaining : 0;
}

/** Optional helper to clear expired matches' metadata (safe no-op). */
export function clearExpiredMatchMeta() {
  const meta = getMeta();
  let changed = false;
  for (const [id, ts] of Object.entries(meta)) {
    const elapsed = Math.floor((Date.now() - ts) / 1000);
    if (elapsed >= DURATION) {
      delete meta[id];
      changed = true;
    }
  }
  if (changed) setMeta(meta);
}
