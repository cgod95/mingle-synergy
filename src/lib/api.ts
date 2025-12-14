/**
 * Stable facade for data APIs. Import from "lib/api" only.
 * Internals can change without breaking pages.
 */
import config from '@/config';
import { getPeopleAtVenue, getPerson as getPersonFromDemoPeople } from './demoPeople';
import { 
  getVenues as getVenuesFromDemoVenues, 
  getVenue as getVenueFromDemoVenues,
  listPeopleForVenue as listPeopleForVenueFromDemoVenues,
  getPerson as getPersonFromDemoVenues
} from './demoVenues';

// Venue functions - use venueService in production (Firestore), demo venues only in demo mode
export async function getVenues() {
  // Always use venueService (handles demo vs production internally)
  try {
    const venueService = await import('@/services/firebase/venueService');
    const venues = await venueService.default.getVenues();
    return venues;
  } catch (error) {
    // In production, return empty array (no demo fallback)
    if (!config.DEMO_MODE) {
      return [];
    }
    // Only fallback to demo venues in demo mode
    return getVenuesFromDemoVenues();
  }
}

export async function getVenue(id: string) {
  // Always use venueService (handles demo vs production internally)
  try {
    const venueService = await import('@/services/firebase/venueService');
    const venue = await venueService.default.getVenueById(id);
    return venue;
  } catch (error) {
    // In production, return null (no demo fallback)
    if (!config.DEMO_MODE) {
      return null;
    }
    // Only fallback to demo venues in demo mode
    return getVenueFromDemoVenues(id);
  }
}

// People functions - use demoPeople in demo mode, demoVenues otherwise
export function getPeople(venueId: string) {
  if (config.DEMO_MODE) {
    return getPeopleAtVenue(venueId);
  }
  return listPeopleForVenueFromDemoVenues(venueId);
}

export const listPeopleForVenue = getPeople;

export function getPerson(id: string) {
  if (config.DEMO_MODE) {
    return getPersonFromDemoPeople(id);
  }
  return getPersonFromDemoVenues(id);
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
