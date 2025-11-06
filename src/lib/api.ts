/**
 * Stable facade for data APIs. Import from "lib/api" only.
 * Internals can change without breaking pages.
 */
export {
  getVenues,
  getVenue,
  listPeopleForVenue as getPeople,
  listPeopleForVenue,
  getPerson
} from "./demoVenues";

export {
  ensureDemoLikesSeed,
  likePerson,
  isMatched,
  listMatches
} from "./likesStore";

export {
  ensureDemoThreadsSeed,
  ensureChat,
  getThread,
  getLastMessage
} from "./chatStore";
