import { Venue } from '@/types';

export const mockVenues: Venue[] = [
  {
    id: 'v1',
    name: 'The Greenhouse Café',
    type: 'Cafe',
    city: 'Sydney',
    address: '123 King St, Newtown',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    vibe: 'Sunny, lots of plants, indie playlist',
    event: 'Live acoustic set every Sunday',
    checkInCount: 7,
    expiryTime: 120
  },
  {
    id: 'v2',
    name: 'Bondi Beach Bar',
    type: 'Bar',
    city: 'Sydney',
    address: '1 Beach Rd, Bondi',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    vibe: 'Beachy, relaxed, surfboards on the wall',
    event: 'Trivia Wednesdays',
    checkInCount: 5,
    expiryTime: 180
  },
  {
    id: 'v3',
    name: 'Sunny Courtyard',
    type: 'Outdoor',
    city: 'Sydney',
    address: '200 Park Ave, Surry Hills',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    vibe: 'Open air, fairy lights, dogs welcome',
    event: 'Yoga in the park, Saturday mornings',
    checkInCount: 4,
    expiryTime: 90
  },
  {
    id: 'v4',
    name: 'Opera Bar',
    type: 'Bar',
    city: 'Sydney',
    address: 'Lower Concourse, Sydney Opera House',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
    vibe: 'Harbour views, live jazz, cocktails',
    event: 'Jazz Fridays',
    checkInCount: 6,
    expiryTime: 180
  },
  {
    id: 'v5',
    name: 'Lune Bakery',
    type: 'Bakery',
    city: 'Melbourne',
    address: '119 Rose St, Fitzroy',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
    vibe: 'Best croissants in town, minimalist decor',
    event: 'Croissant masterclass, first Monday each month',
    checkInCount: 3,
    expiryTime: 60
  },
  {
    id: 'v6',
    name: 'Gallery Lane',
    type: 'Gallery',
    city: 'Sydney',
    address: '50 Art St, Chippendale',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    vibe: 'Modern art, quiet corners, free entry',
    event: 'Open mic poetry, last Friday each month',
    checkInCount: 2,
    expiryTime: 120
  },
  {
    id: 'v7',
    name: 'Skyline Rooftop',
    type: 'Bar',
    city: 'Sydney',
    address: '88 Highview Rd, Darlinghurst',
    image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
    vibe: 'Panoramic city views, sunset DJ sets',
    event: 'Sundown Sessions every Saturday',
    checkInCount: 8,
    expiryTime: 180
  },
  {
    id: 'v8',
    name: 'Leaf & Letter Bookshop',
    type: 'other',
    city: 'Melbourne',
    address: '42 Ink St, Carlton',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    vibe: 'Cozy nooks, handwritten staff picks, coffee aroma',
    event: 'Author Q&A, second Thursday each month',
    checkInCount: 2,
    expiryTime: 120
  }
];

export default mockVenues;
