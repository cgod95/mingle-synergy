import { getPerson } from './demoPeople';
import { listMatches } from './likesStore';
import { ensureChat } from './chatStore';
import config from '@/config';
import { APP_CONSTANTS } from '@/constants/app';

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
  venueName?: string;     // venue where match was made
  venueId?: string;      // venue ID where match was made
};

// Re-export from centralized constants for backwards compatibility
export const MATCH_EXPIRY_MS = APP_CONSTANTS.MATCH_EXPIRY_MS;
export const MATCH_TTL_MS = MATCH_EXPIRY_MS; // Alias for compatibility

// Demo/local store fallback (used only in demo mode)
const DEMO: Record<string, Match[]> = Object.create(null);

// Cache for Firebase matches
const FIREBASE_CACHE: Record<string, { matches: Match[]; fetchedAt: number }> = Object.create(null);
const CACHE_TTL_MS = APP_CONSTANTS.MATCHES_CACHE_TTL_MS;

/**
 * Fetch matches from Firebase and transform to local Match format
 */
async function fetchFirebaseMatches(userId: string): Promise<Match[]> {
  // Check cache first
  const cached = FIREBASE_CACHE[userId];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.matches;
  }
  
  try {
    // Dynamic import to avoid circular dependencies
    const { matchService, userService } = await import('@/services');
    const firebaseMatches = await matchService.getMatches(userId);
    
    const matches: Match[] = await Promise.all(firebaseMatches.map(async (fm: any) => {
      const partnerId = fm.userId1 === userId ? fm.userId2 : fm.userId1;
      
      // Try to get partner's profile
      let displayName = partnerId;
      let avatarUrl = '';
      try {
        const partnerProfile = await userService.getUserProfile(partnerId);
        if (partnerProfile) {
          displayName = partnerProfile.name || partnerId;
          avatarUrl = partnerProfile.photos?.[0] || partnerProfile.photoURL || '';
        }
      } catch {
        // Use defaults if profile fetch fails
      }
      
      return {
        id: fm.id || `match_${partnerId}`,
        userId,
        partnerId,
        createdAt: fm.timestamp,
        expiresAt: fm.timestamp + MATCH_EXPIRY_MS,
        displayName,
        avatarUrl,
        venueName: fm.venueName,
        venueId: fm.venueId,
      };
    }));
    
    // Update cache
    FIREBASE_CACHE[userId] = { matches, fetchedAt: Date.now() };
    
    return matches;
  } catch (error) {
    console.error('Failed to fetch Firebase matches:', error);
    return cached?.matches || [];
  }
}

function seedIfNeeded(userId: string) {
  // Only seed demo data in demo mode
  if (!config.DEMO_MODE) return;
  
  const now = Date.now();
  
  // Get matches from likesStore (mutual likes)
  const matchedIds = listMatches();
  
  // Get demo people for matches - use actual demo people data
  const rose = getPerson('rose') || getPerson('ava') || getPerson('sophia') || getPerson('mila');
  const sam = getPerson('sam') || getPerson('jay') || getPerson('lucas') || getPerson('ethan');
  
  // Build matches from likesStore matches
  // Use a stable ID based on partnerId to avoid creating new matches on every call
  const matchesFromLikes: Match[] = matchedIds.map((partnerId, index) => {
    const person = getPerson(partnerId);
    const venues = ['club-aurora', 'neon-garden', 'luna-lounge', 'venue1', 'venue2', 'venue3'];
    const venueNames = ['Club Aurora', 'Neon Garden', 'Luna Lounge', 'The Roastery', 'Sunset Lounge', 'The Warehouse'];
    const venueIndex = index % venues.length;
    
    // Ensure chat exists for this match
    ensureChat(partnerId, { name: person?.name });
    
    // Check if this match already exists in DEMO to preserve its createdAt and expiresAt
    const existingMatch = DEMO[userId]?.find(m => m.partnerId === partnerId);
    const createdAt = existingMatch?.createdAt || (now - (index * 5 * 60_000));
    const expiresAt = existingMatch?.expiresAt || (createdAt + MATCH_EXPIRY_MS);
    
    return {
      id: `mx_${partnerId}`, // Stable ID based on partnerId
      userId,
      partnerId,
      createdAt,
      expiresAt,
      displayName: person?.name || partnerId,
      avatarUrl: person?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      unreadCount: existingMatch?.unreadCount || 0,
      venueName: venueNames[venueIndex],
      venueId: venues[venueIndex],
    };
  });
  
  // If no matches from likesStore, seed some demo matches
  if (matchesFromLikes.length === 0 && !DEMO[userId]?.length) {
    DEMO[userId] = [
      {
        id: "mx_1",
        userId,
        partnerId: rose?.id || "u_rose",
        createdAt: now - 5 * 60_000,
        expiresAt: now + 2 * 60 * 60_000, // 2h left
        displayName: rose?.name || "Rose",
        avatarUrl: rose?.photo || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
        unreadCount: 1,
        venueName: "Neon Garden",
        venueId: "1",
      },
      {
        id: "mx_2",
        userId,
        partnerId: sam?.id || "u_sam",
        createdAt: now - 60 * 60_000,
        expiresAt: now + 90 * 60_000, // 1.5h left
        displayName: sam?.name || "Sam",
        avatarUrl: sam?.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
        unreadCount: 0,
        venueName: "Club Aurora",
        venueId: "2",
      },
    ];
  } else {
    // Use matches from likesStore
    DEMO[userId] = matchesFromLikes;
  }
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
 * BETA FIX: Now uses Firebase in production mode
 */
export async function getActiveMatches(userId: string): Promise<Match[]> {
  if (!config.DEMO_MODE) {
    // Production: use Firebase
    const matches = await fetchFirebaseMatches(userId);
    return matches.filter(m => !isExpired(m));
  }
  
  // Demo mode: use local storage
  seedIfNeeded(userId);
  return (DEMO[userId] || []).filter(m => !isExpired(m));
}

/**
 * Get all matches for a user (including expired ones)
 * Used for displaying expired matches in UI
 */
export async function getAllMatches(userId: string): Promise<Match[]> {
  if (!config.DEMO_MODE) {
    // Production: use Firebase
    return fetchFirebaseMatches(userId);
  }
  
  // Demo mode: use local storage
  seedIfNeeded(userId);
  return DEMO[userId] || [];
}

// Back-compat alias some pages still call
export async function getMatches(userId: string): Promise<Match[]> {
  return getActiveMatches(userId);
}
