import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { logError } from '@/utils/errorHandler';

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
  venueName?: string;
  venueId?: string;
  _embeddedMessages?: Array<{ senderId: string; text: string; timestamp: number }>;
  /** True when the other user has requested reconnect (rematch) */
  otherUserRequestedReconnect?: boolean;
  /** True when the current user has already requested reconnect */
  iRequestedReconnect?: boolean;
};

export const MATCH_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MATCH_TTL_MS = MATCH_EXPIRY_MS;

export function isExpired(m: Match): boolean {
  return Date.now() >= m.expiresAt;
}

export function getRemainingSeconds(m: Match): number {
  const s = Math.floor((m.expiresAt - Date.now()) / 1000);
  return s > 0 ? s : 0;
}

async function fetchPartnerProfile(partnerId: string): Promise<{ displayName?: string; avatarUrl?: string }> {
  if (!firestore) return {};
  try {
    const userDoc = await getDoc(doc(firestore, 'users', partnerId));
    if (!userDoc.exists()) return {};
    const data = userDoc.data();
    return {
      displayName: data.displayName || data.name || undefined,
      avatarUrl: data.photos?.[0] || undefined,
    };
  } catch {
    return {};
  }
}

function toEpochMs(val: unknown): number {
  if (typeof val === 'number') return val;
  if (val && typeof (val as any).toMillis === 'function') return (val as any).toMillis();
  if (val && typeof (val as any).toDate === 'function') return (val as any).toDate().getTime();
  return 0;
}

async function fetchMatchesFromFirestore(userId: string): Promise<Match[]> {
  if (!firestore) return [];

  try {
    const matchesRef = collection(firestore, 'matches');
    const q1 = query(matchesRef, where('userId1', '==', userId));
    const q2 = query(matchesRef, where('userId2', '==', userId));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const rawMatches = [
      ...snap1.docs.map(d => ({ id: d.id, ...d.data() })),
      ...snap2.docs.map(d => ({ id: d.id, ...d.data() })),
    ] as Array<{ id: string; userId1: string; userId2: string; venueId: string; venueName?: string; timestamp: unknown; matchExpired?: boolean; userRequestedReconnect?: boolean; matchedUserRequestedReconnect?: boolean; reconnectRequestedAt?: unknown; messages?: Array<{ senderId: string; text: string; timestamp: number }> }>;

    const profileCache = new Map<string, Promise<{ displayName?: string; avatarUrl?: string }>>();

    const getCachedProfile = (partnerId: string) => {
      if (!profileCache.has(partnerId)) {
        profileCache.set(partnerId, fetchPartnerProfile(partnerId));
      }
      return profileCache.get(partnerId)!;
    };

    const enriched: Match[] = (await Promise.all(
      rawMatches.map(async (raw) => {
        const partnerId = raw.userId1 === userId ? raw.userId2 : raw.userId1;
        const profile = await getCachedProfile(partnerId);
        const ts = toEpochMs(raw.timestamp);
        if (ts === 0) {
          console.warn('[matchesCompat] Match has invalid timestamp, skipping:', raw.id);
          return null;
        }
        const isUser1 = raw.userId1 === userId;
        const otherUserRequestedReconnect = isUser1 ? !!raw.matchedUserRequestedReconnect : !!raw.userRequestedReconnect;
        const iRequestedReconnect = isUser1 ? !!raw.userRequestedReconnect : !!raw.matchedUserRequestedReconnect;
        return {
          id: raw.id,
          userId,
          partnerId,
          createdAt: ts,
          expiresAt: ts + MATCH_EXPIRY_MS,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          venueName: raw.venueName,
          venueId: raw.venueId,
          _embeddedMessages: raw.messages,
          otherUserRequestedReconnect,
          iRequestedReconnect,
        };
      })
    )).filter((m): m is Match => m !== null);

    // Deduplicate: keep only the newest match per partner
    const byPartner = new Map<string, Match>();
    for (const m of enriched) {
      const existing = byPartner.get(m.partnerId);
      if (!existing || m.createdAt > existing.createdAt) {
        byPartner.set(m.partnerId, m);
      }
    }

    return Array.from(byPartner.values()).sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    logError(error as Error, { source: 'matchesCompat', action: 'fetchMatchesFromFirestore', userId });
    return [];
  }
}

export async function getActiveMatches(userId: string): Promise<Match[]> {
  const all = await fetchMatchesFromFirestore(userId);
  return all.filter(m => !isExpired(m));
}

export async function getAllMatches(userId: string): Promise<Match[]> {
  return fetchMatchesFromFirestore(userId);
}

export async function getMatches(userId: string): Promise<Match[]> {
  return getActiveMatches(userId);
}
