export type Match = {
  id: string;
  userId: string;        // current user
  partnerId: string;     // the other person
  createdAt: number;     // ms epoch
  expiresAt: number;     // ms epoch
  lastMessageAt?: number;
  unreadCount?: number;
  displayName?: string;
  avatarUrl?: string;
};

// Single source of truth for match expiry (3 hours)
export const MATCH_EXPIRY_MS = 3 * 60 * 60 * 1000;
export const MATCH_TTL_MS = MATCH_EXPIRY_MS; // Alias for compatibility

// Demo/local store fallback (UI-first; replace with Firestore wiring later)
const DEMO: Record<string, Match[]> = Object.create(null);

function seedIfNeeded(userId: string) {
  if (DEMO[userId]?.length) return;
  const now = Date.now();
  DEMO[userId] = [
    {
      id: "mx_1",
      userId,
      partnerId: "u_rose",
      createdAt: now - 5 * 60_000,
      expiresAt: now + 2 * 60 * 60_000, // 2h left
      displayName: "Rose",
      avatarUrl: "/assets/avatars/rose.jpg",
      unreadCount: 1,
    },
    {
      id: "mx_2",
      userId,
      partnerId: "u_sam",
      createdAt: now - 60 * 60_000,
      expiresAt: now + 90 * 60_000, // 1.5h left
      displayName: "Sam",
      avatarUrl: "/assets/avatars/sam.jpg",
      unreadCount: 0,
    },
  ];
}

/**
 * Check if a match has expired
 * Single source of truth - all components must use this
 */
export function isExpired(m: Match): boolean {
  return Date.now() >= m.expiresAt;
}

/**
 * Get remaining seconds until match expires
 * Returns 0 if already expired
 */
export function getRemainingSeconds(m: Match): number {
  const s = Math.floor((m.expiresAt - Date.now()) / 1000);
  return s > 0 ? s : 0;
}

/**
 * Get all active (non-expired) matches for a user
 * This is the canonical function - use this instead of direct Firestore queries
 */
export async function getActiveMatches(userId: string): Promise<Match[]> {
  seedIfNeeded(userId);
  return (DEMO[userId] || []).filter(m => !isExpired(m));
}

// Back-compat alias some pages still call
export async function getMatches(userId: string): Promise<Match[]> {
  return getActiveMatches(userId);
}
