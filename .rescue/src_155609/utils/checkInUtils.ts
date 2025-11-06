// 🧠 Purpose: Add utility logic to determine if a user has checked into a venue. This is used to gate access to features like liking or messaging inside the venue.

export const hasCheckedIn = (checkedInVenues: string[], venueId: string): boolean => {
  return checkedInVenues.includes(venueId);
}; 