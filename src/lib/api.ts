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

// Venue functions - use venueService in demo mode (has 8 venues with numeric IDs matching demoPeople)
export async function getVenues() {
  if (config.DEMO_MODE) {
    try {
      const venueService = await import('@/services/firebase/venueService');
      return await venueService.default.getVenues();
    } catch {
      // Fallback to demoVenues if venueService fails
      return getVenuesFromDemoVenues();
    }
  }
  return getVenuesFromDemoVenues();
}

export async function getVenue(id: string) {
  if (config.DEMO_MODE) {
    try {
      const venueService = await import('@/services/firebase/venueService');
      return await venueService.default.getVenueById(id);
    } catch {
      // Fallback to demoVenues if venueService fails
      return getVenueFromDemoVenues(id);
    }
  }
  return getVenueFromDemoVenues(id);
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
