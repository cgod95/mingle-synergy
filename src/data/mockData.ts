
import { User, Venue, Match, Interest } from '@/types';

// Mock venues
export const venues: Venue[] = [
  {
    id: 'v1',
    name: 'The Grounds of Alexandria',
    type: 'cafe',
    address: '7A Huntley St, Alexandria NSW 2015',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
    checkInCount: 15,
    expiryTime: 120 // 2 hours in minutes
  },
  {
    id: 'v2',
    name: 'Opera Bar',
    type: 'bar',
    address: 'Lower Concourse, Sydney Opera House, Macquarie St',
    image: 'https://images.unsplash.com/photo-1503097581674-a2bfb450dbda',
    checkInCount: 27,
    expiryTime: 180 // 3 hours in minutes
  },
  {
    id: 'v3',
    name: 'Fitness First Darlinghurst',
    type: 'gym',
    address: '101-103 Oxford St, Darlinghurst NSW 2010',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    checkInCount: 8,
    expiryTime: 120 // 2 hours in minutes
  },
  {
    id: 'v4',
    name: 'The Winery',
    type: 'restaurant',
    address: '285A Crown St, Surry Hills NSW 2010',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    checkInCount: 21,
    expiryTime: 180 // 3 hours in minutes
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
    address: 'Mrs Macquaries Rd, Sydney NSW 2000',
    image: 'https://images.unsplash.com/photo-1597212720128-3348aba9218d',
    checkInCount: 12,
    expiryTime: 180 // 3 hours in minutes
  }
];

// Mock users
export const users: User[] = [
  {
    id: 'u1',
    name: 'Alex',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'],
    isCheckedIn: true,
    currentVenue: 'v1',
    isVisible: true,
    interests: ['coffee', 'books']
  },
  {
    id: 'u2',
    name: 'Jordan',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330'],
    isCheckedIn: true,
    currentVenue: 'v1',
    isVisible: true,
    interests: ['art', 'photography']
  },
  {
    id: 'u3',
    name: 'Taylor',
    photos: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'],
    isCheckedIn: true,
    currentVenue: 'v2',
    isVisible: false,
    interests: ['music', 'cocktails']
  },
  {
    id: 'u4',
    name: 'Morgan',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb'],
    isCheckedIn: true,
    currentVenue: 'v2',
    isVisible: true,
    interests: ['hiking', 'travel']
  },
  {
    id: 'u5',
    name: 'Casey',
    photos: ['https://images.unsplash.com/photo-1519345182560-3f2917c472ef'],
    isCheckedIn: true,
    currentVenue: 'v3',
    isVisible: true,
    interests: ['fitness', 'health']
  },
  {
    id: 'u6',
    name: 'Riley',
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2'],
    isCheckedIn: false,
    isVisible: true,
    interests: ['food', 'wine']
  }
];

// Mock interests
export const interests: Interest[] = [
  {
    id: 'i1',
    fromUserId: 'u1',
    toUserId: 'u2',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    isActive: true
  },
  {
    id: 'i2',
    fromUserId: 'u2',
    toUserId: 'u1',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 3, // 3 minutes ago
    isActive: true
  },
  {
    id: 'i3',
    fromUserId: 'u3',
    toUserId: 'u4',
    venueId: 'v2',
    timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    isActive: true
  }
];

// Mock matches
export const matches: Match[] = [
  {
    id: 'm1',
    userId: 'u1',
    matchedUserId: 'u2',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3 // Expires in 3 hours
  }
];

// Get users at a venue
export const getUsersAtVenue = (venueId: string): User[] => {
  return users.filter(user => user.currentVenue === venueId && user.isVisible);
};

// Check if there is a mutual interest
export const hasMutualInterest = (userId: string, otherUserId: string): boolean => {
  const userInterested = interests.some(
    interest => interest.fromUserId === userId && interest.toUserId === otherUserId && interest.isActive
  );
  
  const otherUserInterested = interests.some(
    interest => interest.fromUserId === otherUserId && interest.toUserId === userId && interest.isActive
  );
  
  return userInterested && otherUserInterested;
};

// Get a user's matches
export const getUserMatches = (userId: string): Match[] => {
  return matches.filter(
    match => (match.userId === userId || match.matchedUserId === userId) && match.isActive
  );
};
