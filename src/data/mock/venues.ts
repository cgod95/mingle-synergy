
import { Venue } from '@/types';

export const mockVenues: Venue[] = [
  {
    id: 'v1',
    name: 'The Grounds of Alexandria',
    type: 'cafe',
    address: '7A Huntley St, Alexandria NSW 2015',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    checkInCount: 15,
    expiryTime: 120, // 2 hours in minutes
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
    image: 'https://images.unsplash.com/photo-1503097581674-a2bfb450dbda',
    checkInCount: 27,
    expiryTime: 180, // 3 hours in minutes
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
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    checkInCount: 8,
    expiryTime: 120 // 2 hours in minutes
  },
  {
    id: 'v4',
    name: 'The Winery',
    type: 'restaurant',
    address: '285A Crown St, Surry Hills',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    checkInCount: 21,
    expiryTime: 180, // 3 hours in minutes
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
    image: 'https://images.unsplash.com/photo-1562184552-997c461abbe6',
    checkInCount: 45,
    expiryTime: 240 // 4 hours in minutes
  },
  {
    id: 'v6',
    name: 'The Royal Botanic Garden',
    type: 'other',
    address: 'Mrs Macquaries Rd, Sydney',
    image: 'https://images.unsplash.com/photo-1597212720128-3348aba9218d',
    checkInCount: 12,
    expiryTime: 180 // 3 hours in minutes
  }
];

export default mockVenues;
