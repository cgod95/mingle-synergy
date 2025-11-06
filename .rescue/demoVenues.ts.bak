export type Venue = {
  id: string;
  name: string;
  image: string;
  blurb: string;
  checkedInIds: string[];
};

export const DEMO_VENUES: Venue[] = [
  {
    id: "club-aurora",
    name: "Club Aurora",
    image: "/venues/club-aurora.svg",
    blurb: "Neon dance floor, late sessions, house & techno.",
    checkedInIds: ["ava","jay","lucas","sophia"]
  },
  {
    id: "warehouse-nine",
    name: "Warehouse Nine",
    image: "/venues/warehouse-nine.svg",
    blurb: "Industrial warehouse, live acts, pop-ups.",
    checkedInIds: ["mila","ethan","zoe","liam"]
  },
  {
    id: "rooftop-garden",
    name: "Rooftop Garden",
    image: "/venues/rooftop-garden.svg",
    blurb: "Open air, city skyline views, sundown sets.",
    checkedInIds: ["noah","mia","oliver","isla"]
  },
];

export function getVenues() { return DEMO_VENUES; }
export function getVenue(id: string) { return DEMO_VENUES.find(v => v.id === id); }
