export type Venue = {
  id: string;
  name: string;
  image: string;
  address?: string;
};

export type Person = {
  id: string;
  name: string;
  photo: string;
  age?: number;
};

const VENUES: Venue[] = [
  {
    id: "club-aurora",
    name: "Club Aurora",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop",
    address: "12 Aurora Ave",
  },
  {
    id: "neon-garden",
    name: "Neon Garden",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop",
    address: "88 Neon St",
  },
  {
    id: "luna-lounge",
    name: "Luna Lounge",
    image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1200&auto=format&fit=crop",
    address: "5 Crescent Rd",
  },
];

const PEOPLE_BY_VENUE: Record<string, Person[]> = {
  "club-aurora": [
    { id: "chloe", name: "Chloe", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop", age: 26 },
    { id: "lucas", name: "Lucas", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop", age: 28 },
    { id: "nina",  name: "Nina",  photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop", age: 24 },
  ],
  "neon-garden": [
    { id: "maya",  name: "Maya",  photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop", age: 25 },
    { id: "andre", name: "Andre", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop", age: 29 },
  ],
  "luna-lounge": [
    { id: "sara",  name: "Sara",  photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop", age: 27 },
    { id: "kevin", name: "Kevin", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop", age: 30 },
  ],
};

/** List all venues */
export function getVenues(): Venue[] {
  return VENUES;
}

/** Get a single venue by id */
export function getVenue(id: string): Venue | undefined {
  return VENUES.find(v => v.id === id);
}

/** People currently at a venue — ALWAYS returns an array */
export function listPeopleForVenue(venueId: string): Person[] {
  return PEOPLE_BY_VENUE[venueId] ? [...PEOPLE_BY_VENUE[venueId]] : [];
}

/** Helper to find a person by id across all venues */
export function getPerson(id: string): Person | undefined {
  for (const arr of Object.values(PEOPLE_BY_VENUE)) {
    const p = arr.find(x => x.id === id);
    if (p) return p;
  }
  return undefined;
}

/** Optional alias if any legacy import expects this name */
export { listPeopleForVenue as getPeople };
