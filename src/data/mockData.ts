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
    address: 'Lower Concourse, Sydney Opera House',
    image: 'https://images.unsplash.com/photo-1503097581674-a2bfb450dbda',
    checkInCount: 27,
    expiryTime: 180 // 3 hours in minutes
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
    address: 'Mrs Macquaries Rd, Sydney',
    image: 'https://images.unsplash.com/photo-1597212720128-3348aba9218d',
    checkInCount: 12,
    expiryTime: 180 // 3 hours in minutes
  }
];

// Fixed set of 12 user profiles to display at any venue
export const users: User[] = [
  {
    id: 'u1',
    name: 'Alex',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'
    ],
    bio: 'Coffee enthusiast and book lover',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Near Counter',
    zone: 'Near Counter',
    isVisible: true,
    interests: ['coffee', 'books'],
    gender: 'male',
    interestedIn: ['female'],
    age: 28,
    ageRangePreference: {
      min: 25,
      max: 35
    },
    matches: ['u2'],
    likedUsers: ['u2'],
    blockedUsers: []
  },
  {
    id: 'u2',
    name: 'Jordan',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'
    ],
    bio: 'Art lover and photographer',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Seated Area',
    zone: 'Seated Area',
    isVisible: true,
    interests: ['art', 'photography'],
    gender: 'female',
    interestedIn: ['male'],
    age: 26,
    ageRangePreference: {
      min: 25,
      max: 35
    },
    matches: ['u1'],
    likedUsers: ['u1'],
    blockedUsers: []
  },
  {
    id: 'u3',
    name: 'Taylor',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    ],
    bio: 'Music lover and cocktail enthusiast',
    isCheckedIn: true,
    currentVenue: 'v1',
    isVisible: true,
    interests: ['music', 'cocktails'],
    gender: 'non-binary',
    interestedIn: ['male', 'female', 'non-binary'],
    age: 29,
    ageRangePreference: {
      min: 25,
      max: 40
    },
    matches: [],
    likedUsers: ['u4'],
    blockedUsers: []
  },
  {
    id: 'u4',
    name: 'Morgan',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
    ],
    bio: 'Adventure seeker and world traveler',
    isCheckedIn: true,
    currentVenue: 'v1',
    isVisible: true,
    interests: ['hiking', 'travel'],
    gender: 'female',
    interestedIn: ['male'],
    age: 31,
    ageRangePreference: {
      min: 28,
      max: 38
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u5',
    name: 'Casey',
    photos: [
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'
    ],
    bio: 'Fitness enthusiast and health advocate',
    isCheckedIn: true,
    currentVenue: 'v1',
    isVisible: true,
    interests: ['fitness', 'health'],
    gender: 'male',
    interestedIn: ['female'],
    age: 33,
    ageRangePreference: {
      min: 28,
      max: 40
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u6',
    name: 'Riley',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04'
    ],
    bio: 'Foodie and wine connoisseur',
    isCheckedIn: true,
    currentVenue: 'v1',
    isVisible: true,
    interests: ['food', 'wine'],
    gender: 'female',
    interestedIn: ['male', 'female'],
    age: 27,
    ageRangePreference: {
      min: 25,
      max: 35
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u7',
    name: 'Emma',
    photos: [
      'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
    ],
    bio: 'Avid reader and coffee addict',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Near Counter',
    zone: 'Near Counter',
    isVisible: true,
    interests: ['reading', 'coffee'],
    gender: 'female',
    interestedIn: ['male'],
    age: 27,
    ageRangePreference: {
      min: 25,
      max: 38
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u8',
    name: 'Michael',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    ],
    bio: 'Professional photographer, looking for inspiration',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Outside',
    zone: 'Outside',
    isVisible: true,
    interests: ['photography', 'arts'],
    gender: 'male',
    interestedIn: ['female'],
    age: 31,
    ageRangePreference: {
      min: 27,
      max: 36
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u9',
    name: 'Sophia',
    photos: [
      'https://images.unsplash.com/photo-1535295972055-1c762f4483e5',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
    ],
    bio: 'Yoga teacher and plant-based chef',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Seated Area',
    zone: 'Seated Area',
    isVisible: true,
    interests: ['yoga', 'cooking'],
    gender: 'female',
    interestedIn: ['male', 'female'],
    age: 29,
    ageRangePreference: {
      min: 25,
      max: 40
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u10',
    name: 'Liam',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
    ],
    bio: 'Finance professional, loves live music',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'At the Bar',
    zone: 'At the Bar',
    isVisible: true,
    interests: ['music', 'cocktails'],
    gender: 'male',
    interestedIn: ['female'],
    age: 32,
    ageRangePreference: {
      min: 28,
      max: 38
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u11',
    name: 'Olivia',
    photos: [
      'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04'
    ],
    bio: 'Opera singer and wine enthusiast',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Near Entrance',
    zone: 'Near Entrance',
    isVisible: true,
    interests: ['classical music', 'wine'],
    gender: 'female',
    interestedIn: ['male'],
    age: 28,
    ageRangePreference: {
      min: 27,
      max: 40
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u12',
    name: 'Noah',
    photos: [
      'https://images.unsplash.com/photo-1534614971-6be99a7a3ffd',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    ],
    bio: 'Musician and craft beer enthusiast',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'At the Bar',
    zone: 'At the Bar',
    isVisible: true,
    interests: ['guitar', 'craft beer'],
    gender: 'male',
    interestedIn: ['female'],
    age: 30,
    ageRangePreference: {
      min: 25,
      max: 35
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  }
];

// Get users at a venue - Enhanced to ensure we always return results
export const getUsersAtVenue = (venueId: string): User[] => {
  return users.map(user => ({ 
    ...user, 
    currentVenue: venueId,  // Set all users to be at the requested venue
    isCheckedIn: true 
  }));
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
