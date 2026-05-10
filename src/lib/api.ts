/**
 * Stable facade for data APIs. Import from "lib/api" only.
 * Internals can change without breaking pages.
 */
import config from '@/config';
import { getPeopleAtVenue, getPerson as getPersonFromDemoPeople, type Person } from './demoPeople';
import {
  getVenues as getVenuesFromDemoVenues,
  getVenue as getVenueFromDemoVenues
} from './demoVenues';
import { getBotForVenue, isMingleBot, MINGLE_BOT } from './mingleBot';

const isDev = !import.meta.env.PROD;

// Venue functions - use venueService in production (Firestore), demo venues only in demo mode
export async function getVenues() {
  try {
    const venueService = await import('@/services/firebase/venueService');
    const venues = await venueService.default.getVenues();
    if (isDev) console.log('[api] Loaded venues from venueService:', venues.length);
    return venues;
  } catch (error) {
    if (isDev) console.error('[api] Error loading venues from venueService:', error);
    if (!config.DEMO_MODE) {
      return [];
    }
    return getVenuesFromDemoVenues();
  }
}

export async function getVenue(id: string) {
  try {
    const venueService = await import('@/services/firebase/venueService');
    const venue = await venueService.default.getVenueById(id);
    if (isDev) console.log('[api] Loaded venue:', id, venue ? venue.name : 'not found');
    return venue;
  } catch (error) {
    if (isDev) console.error('[api] Error loading venue from venueService:', id, error);
    if (!config.DEMO_MODE) {
      return null;
    }
    return getVenueFromDemoVenues(id);
  }
}

/**
 * Get people at a venue.
 * Demo mode: returns demo people + Mingle Bot.
 * Live mode: returns [] - use usePeopleAtVenue hook for real Firestore data.
 */
export function getPeople(venueId: string): Person[] {
  if (!config.DEMO_MODE) {
    return []; // Live mode: use usePeopleAtVenue (Firestore) instead
  }
  let people = getPeopleAtVenue(venueId);
  const bot = getBotForVenue(venueId);
  const hasBot = people.some(p => isMingleBot(p.id));
  if (!hasBot) people = [bot, ...people];
  return people;
}

export const listPeopleForVenue = getPeople;

export function getPerson(id: string): Person | undefined {
  if (isMingleBot(id)) return MINGLE_BOT;
  if (!config.DEMO_MODE) return undefined; // Live mode: use userService/Firestore
  return getPersonFromDemoPeople(id);
}

export {
  ensureDemoLikesSeed,
  likePerson,
  isMatched,
  isLiked,
  listMatches
} from "./likesStore";

export {
  ensureDemoThreadsSeed,
  ensureChat,
  getThread,
  getLastMessage
} from "./chatStore";
