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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:15',message:'getVenues called',data:{stackTrace:new Error().stack?.split('\n').slice(0,5).join('|')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  // Always use venueService (handles demo vs production internally)
  try {
    const venueService = await import('@/services/firebase/venueService');
    const venues = await venueService.default.getVenues();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:20',message:'getVenues success',data:{venueCount:venues.length,venueIds:venues.map(v=>v.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log('[api] Loaded venues from venueService:', venues.length, venues.map(v => v.id));
    return venues;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:23',message:'getVenues error',data:{error:String(error),demoMode:config.DEMO_MODE},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('[api] Error loading venues from venueService:', error);
    // In production, return empty array (no demo fallback)
    if (!config.DEMO_MODE) {
      return [];
    }
    // Only fallback to demo venues in demo mode
    console.log('[api] Falling back to demoVenues');
    return getVenuesFromDemoVenues();
  }
}

export async function getVenue(id: string) {
  // Always use venueService (handles demo vs production internally)
  try {
    const venueService = await import('@/services/firebase/venueService');
    const venue = await venueService.default.getVenueById(id);
    console.log('[api] Loaded venue:', id, venue ? venue.name : 'not found');
    return venue;
  } catch (error) {
    console.error('[api] Error loading venue from venueService:', id, error);
    // In production, return null (no demo fallback)
    if (!config.DEMO_MODE) {
      return null;
    }
    // Only fallback to demo venues in demo mode
    console.log('[api] Falling back to demoVenues');
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
