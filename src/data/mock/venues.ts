import { Venue } from '@/types/services';

export const mockVenues: Venue[] = [
  {
    id: 'v1',
    name: 'The Grounds of Alexandria',
    type: 'cafe',
    address: '7A Huntley St, Alexandria NSW 2015',
    city: 'Sydney',
    latitude: -33.9106,
    longitude: 151.1957,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    checkInCount: 16,
    expiryTime: 120, // 2 hours in minutes
    zones: [],
    checkedInUsers: [
      'u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15','u16'
    ],
    specials: [
      {
        title: "Happy Hour: 2-4PM",
        description: "50% off all coffee and pastries"
      },
      {
        title: "Weekend Brunch Special",
        description: "Bottomless mimosas with any breakfast purchase"
      }
    ]
  },
  {
    id: 'v2',
    name: 'Opera Bar',
    type: 'bar',
    address: 'Lower Concourse, Sydney Opera House',
    city: 'Sydney',
    latitude: -33.8572,
    longitude: 151.2153,
    image: 'https://images.unsplash.com/photo-1503097581674-a2bfb450dbda',
    checkInCount: 16,
    expiryTime: 180, // 3 hours in minutes
    zones: [],
    checkedInUsers: [
      'u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15','u16'
    ],
    specials: [
      {
        title: "Cocktail Hour",
        description: "Buy one get one free on signature cocktails from 5-7PM"
      }
    ]
  },
  {
    id: 'v3',
    name: 'Fitness First Darlinghurst',
    type: 'gym',
    address: '101-103 Oxford St, Darlinghurst',
    city: 'Sydney',
    latitude: -33.8792,
    longitude: 151.2151,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    checkInCount: 16,
    expiryTime: 120, // 2 hours in minutes
    zones: [],
    checkedInUsers: [
      'u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15','u16'
    ],
    specials: []
  },
  {
    id: 'v4',
    name: 'The Winery',
    type: 'restaurant',
    address: '285A Crown St, Surry Hills',
    city: 'Sydney',
    latitude: -33.8830,
    longitude: 151.2152,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    checkInCount: 16,
    expiryTime: 180, // 3 hours in minutes
    zones: [],
    checkedInUsers: [
      'u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15','u16'
    ],
    specials: [
      {
        title: "Wine Wednesday",
        description: "Half price bottles of selected wines"
      },
      {
        title: "Chef's Special",
        description: "Three-course tasting menu for $65 per person"
      }
    ]
  },
  {
    id: 'v5',
    name: 'Bondi Beach',
    type: 'other',
    address: 'Bondi Beach, NSW 2026',
    city: 'Sydney',
    latitude: -33.8908,
    longitude: 151.2743,
    image: 'https://images.unsplash.com/photo-1562184552-997c461abbe6',
    checkInCount: 16,
    expiryTime: 240, // 4 hours in minutes
    zones: [],
    checkedInUsers: [
      'u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15','u16'
    ],
    specials: []
  },
  {
    id: 'v6',
    name: 'The Royal Botanic Garden',
    type: 'other',
    address: 'Mrs Macquaries Rd, Sydney',
    city: 'Sydney',
    latitude: -33.8642,
    longitude: 151.2166,
    image: 'https://images.unsplash.com/photo-1597212720128-3348aba9218d',
    checkInCount: 16,
    expiryTime: 180, // 3 hours in minutes
    zones: [],
    checkedInUsers: [
      'u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15','u16'
    ],
    specials: []
  }
];

export default mockVenues;
