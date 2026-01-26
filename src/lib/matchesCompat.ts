import { getPerson } from './api';
import { listMatches } from './likesStore';
import { ensureChat } from './chatStore';
import config from '@/config';

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

// Single source of truth for match expiry (24 hours per user decision)
export const MATCH_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MATCH_TTL_MS = MATCH_EXPIRY_MS; // Alias for compatibility

// Demo/local store fallback (UI-first; replace with Firestore wiring later)
const DEMO: Record<string, Match[]> = Object.create(null);

function seedIfNeeded(userId: string) {
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
    const venues = ['1', '2', '3', '4', '5', '6'];
    const venueNames = ['Neon Garden', 'Club Aurora', 'The Roastery', 'Sunset Lounge', 'The Warehouse', 'Garden Bistro'];
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
  
  // If no matches from likesStore, seed some demo matches (only in demo mode)
  if (config.DEMO_MODE && matchesFromLikes.length === 0 && !DEMO[userId]?.length) {
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
 */
export async function getActiveMatches(userId: string): Promise<Match[]> {
  seedIfNeeded(userId);
  return (DEMO[userId] || []).filter(m => !isExpired(m));
}

/**
 * Get all matches for a user (including expired ones)
 * Used for displaying expired matches in UI
 */
export async function getAllMatches(userId: string): Promise<Match[]> {
  seedIfNeeded(userId);
  return DEMO[userId] || [];
}

// Back-compat alias some pages still call
export async function getMatches(userId: string): Promise<Match[]> {
  return getActiveMatches(userId);
}
