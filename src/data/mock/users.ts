import { User } from '@/types';

export const mockUsers: User[] = [
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
    matches: ['u2', 'u3'],
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
    matches: ['u1', 'u4'],
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
    matches: ['u1', 'u5'],
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
    matches: ['u2', 'u6'],
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
    matches: ['u1', 'u7'],
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
    matches: ['u2', 'u8'],
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
    matches: ['u3', 'u9'],
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
    matches: ['u4', 'u10'],
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
    matches: ['u5', 'u11'],
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
    matches: ['u6', 'u12'],
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
    matches: ['u7', 'u13'],
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
    matches: ['u8', 'u14'],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u13',
    name: 'Harper',
    photos: [
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca'
    ],
    bio: 'Tech entrepreneur and marathon runner',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Lounge',
    zone: 'Lounge',
    isVisible: true,
    interests: ['technology', 'running', 'startups'],
    gender: 'non-binary',
    interestedIn: ['female', 'male', 'non-binary'],
    age: 34,
    ageRangePreference: {
      min: 28,
      max: 40
    },
    matches: ['u9', 'u15'],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u14',
    name: 'Avery',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9'
    ],
    bio: 'Dog lover, foodie, and aspiring chef',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Patio',
    zone: 'Patio',
    isVisible: true,
    interests: ['dogs', 'cooking', 'travel'],
    gender: 'female',
    interestedIn: ['male', 'female'],
    age: 25,
    ageRangePreference: {
      min: 23,
      max: 32
    },
    matches: ['u10', 'u16'],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u15',
    name: 'Dylan',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91',
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167'
    ],
    bio: 'Cyclist, gamer, and craft beer fan',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Game Room',
    zone: 'Game Room',
    isVisible: true,
    interests: ['cycling', 'gaming', 'craft beer'],
    gender: 'male',
    interestedIn: ['female', 'non-binary'],
    age: 29,
    ageRangePreference: {
      min: 25,
      max: 35
    },
    matches: ['u11', 'u16'],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u16',
    name: 'Quinn',
    photos: [
      'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
      'https://images.unsplash.com/photo-1519340333755-c1aa5571fd46'
    ],
    bio: 'Poet, jazz lover, and vintage collector',
    isCheckedIn: true,
    currentVenue: 'v1',
    currentZone: 'Balcony',
    zone: 'Balcony',
    isVisible: true,
    interests: ['poetry', 'jazz', 'vintage'],
    gender: 'male',
    interestedIn: ['female', 'male'],
    age: 36,
    ageRangePreference: {
      min: 30,
      max: 40
    },
    matches: ['u12', 'u15'],
    likedUsers: [],
    blockedUsers: []
  }
];

// Function to get users at a venue - Enhanced to ensure we always return results
export const getUsersAtVenue = (venueId: string): User[] => {
  return mockUsers.map(user => ({ 
    ...user, 
    currentVenue: venueId,  // Set all users to be at the requested venue
    isCheckedIn: true 
  }));
};

export default mockUsers;
