
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

// Function to get users at a venue - Enhanced to ensure we always return results
export const getUsersAtVenue = (venueId: string): User[] => {
  return mockUsers.map(user => ({ 
    ...user, 
    currentVenue: venueId,  // Set all users to be at the requested venue
    isCheckedIn: true 
  }));
};

export default mockUsers;
