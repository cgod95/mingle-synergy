/**
 * Single stable import surface for data. Pages import from "lib/api" only.
 * If internals change, we update this file—not all pages.
 */
export { getVenues, getVenue, listPeopleForVenue as getPeople, listPeopleForVenue, getPerson } from "./demoVenues";
export { ensureDemoLikesSeed, likePerson, isMatched, listMatches } from "./likesStore";
export { ensureDemoThreadsSeed, ensureChat, getThread, getLastMessage } from "./chatStore";
