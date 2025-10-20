export type Venue = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  hours?: string;
  heroImage?: string;
};

export const VENUES: Venue[] = [
  {
    id: "v1",
    name: "Bar One",
    description: "Chill vibes, outdoor seating",
    address: "12 King St",
    hours: "Mon–Sun 12:00–23:00",
    heroImage: "https://picsum.photos/seed/barone/1200/600",
  },
  {
    id: "v2",
    name: "Bar Two",
    description: "Live music, craft beer",
    address: "88 Market Ln",
    hours: "Thu–Sun 16:00–01:00",
    heroImage: "https://picsum.photos/seed/bartwo/1200/600",
  },
  {
    id: "v3",
    name: "Bar Three",
    description: "Cocktails & small plates",
    address: "5 Harbour Rd",
    hours: "Wed–Sat 17:00–00:00",
    heroImage: "https://picsum.photos/seed/barthree/1200/600",
  },
];

export const getVenue = (id: string) => VENUES.find(v => v.id === id) || null;
