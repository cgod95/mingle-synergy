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
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330'],
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
    photos: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'],
    bio: 'Music lover and cocktail enthusiast',
    isCheckedIn: true,
    currentVenue: 'v2',
    isVisible: false,
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
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb'],
    bio: 'Adventure seeker and world traveler',
    isCheckedIn: true,
    currentVenue: 'v2',
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
    photos: ['https://images.unsplash.com/photo-1519345182560-3f2917c472ef'],
    bio: 'Fitness enthusiast and health advocate',
    isCheckedIn: true,
    currentVenue: 'v3',
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
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2'],
    bio: 'Foodie and wine connoisseur',
    isCheckedIn: false,
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
    photos: ['https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6'],
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
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e'],
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
    photos: ['https://images.unsplash.com/photo-1535295972055-1c762f4483e5'],
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
    photos: ['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce'],
    bio: 'Finance professional, loves live music',
    isCheckedIn: true,
    currentVenue: 'v2',
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
    photos: ['https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8'],
    bio: 'Opera singer and wine enthusiast',
    isCheckedIn: true,
    currentVenue: 'v2',
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
    photos: ['https://images.unsplash.com/photo-1534614971-6be99a7a3ffd'],
    bio: 'Musician and craft beer enthusiast',
    isCheckedIn: true,
    currentVenue: 'v2',
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
  },
  {
    id: 'u13',
    name: 'Ava',
    photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04'],
    bio: 'Fitness instructor, loves hiking and healthy eating',
    isCheckedIn: true,
    currentVenue: 'v3',
    currentZone: 'Cardio Section',
    zone: 'Cardio Section',
    isVisible: true,
    interests: ['fitness', 'nutrition'],
    gender: 'female',
    interestedIn: ['male'],
    age: 26,
    ageRangePreference: {
      min: 25,
      max: 35
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u14',
    name: 'William',
    photos: ['https://images.unsplash.com/photo-1504257432389-52343af06ae3'],
    bio: 'Personal trainer and sports enthusiast',
    isCheckedIn: true,
    currentVenue: 'v3',
    currentZone: 'Weights Area',
    zone: 'Weights Area',
    isVisible: true,
    interests: ['weightlifting', 'sports'],
    gender: 'male',
    interestedIn: ['female'],
    age: 29,
    ageRangePreference: {
      min: 24,
      max: 34
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u15',
    name: 'Isabella',
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'],
    bio: 'Wine connoisseur and food blogger',
    isCheckedIn: true,
    currentVenue: 'v4',
    currentZone: 'Inside',
    zone: 'Inside',
    isVisible: true,
    interests: ['wine', 'food'],
    gender: 'female',
    interestedIn: ['male'],
    age: 31,
    ageRangePreference: {
      min: 29,
      max: 42
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u16',
    name: 'James',
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'],
    bio: 'Chef and whiskey enthusiast',
    isCheckedIn: true,
    currentVenue: 'v4',
    currentZone: 'At the Bar',
    zone: 'At the Bar',
    isVisible: true,
    interests: ['cooking', 'whiskey'],
    gender: 'male',
    interestedIn: ['female'],
    age: 34,
    ageRangePreference: {
      min: 28,
      max: 38
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u17',
    name: 'Sarah',
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'],
    bio: 'Beach lover and surfer',
    isCheckedIn: true,
    currentVenue: 'v5',
    currentZone: 'North End',
    zone: 'North End',
    isVisible: true,
    interests: ['surfing', 'volleyball'],
    gender: 'female',
    interestedIn: ['male'],
    age: 26,
    ageRangePreference: {
      min: 24,
      max: 36
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u18',
    name: 'Jake',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600'],
    bio: 'Surfer and yoga enthusiast',
    isCheckedIn: true,
    currentVenue: 'v5',
    currentZone: 'South End',
    zone: 'South End',
    isVisible: true,
    interests: ['surfing', 'yoga'],
    gender: 'male',
    interestedIn: ['female'],
    age: 29,
    ageRangePreference: {
      min: 25,
      max: 35
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u19',
    name: 'Alice',
    photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600'],
    bio: 'Ocean swimmer and volleyball player',
    isCheckedIn: true,
    currentVenue: 'v5',
    currentZone: 'Volleyball Courts',
    zone: 'Volleyball Courts',
    isVisible: true,
    interests: ['swimming', 'volleyball'],
    gender: 'female',
    interestedIn: ['male'],
    age: 28,
    ageRangePreference: {
      min: 26,
      max: 38
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u20',
    name: 'Marcus',
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'],
    bio: 'Lifeguard and fitness enthusiast',
    isCheckedIn: true,
    currentVenue: 'v5',
    currentZone: 'Lifeguard Tower',
    zone: 'Lifeguard Tower',
    isVisible: true,
    interests: ['swimming', 'fitness'],
    gender: 'male',
    interestedIn: ['female'],
    age: 32,
    ageRangePreference: {
      min: 28,
      max: 36
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u21',
    name: 'Olivia',
    photos: ['https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=600'],
    bio: 'Beach volleyball player and sun seeker',
    isCheckedIn: true,
    currentVenue: 'v5',
    currentZone: 'Volleyball Courts',
    zone: 'Volleyball Courts',
    isVisible: true,
    interests: ['volleyball', 'tanning'],
    gender: 'female',
    interestedIn: ['male'],
    age: 27,
    ageRangePreference: {
      min: 26,
      max: 38
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u22',
    name: 'Daniel',
    photos: ['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600'],
    bio: 'Surfer and beach volleyball enthusiast',
    isCheckedIn: true,
    currentVenue: 'v5',
    currentZone: 'South End',
    zone: 'South End',
    isVisible: true,
    interests: ['surfing', 'volleyball'],
    gender: 'male',
    interestedIn: ['female'],
    age: 31,
    ageRangePreference: {
      min: 27,
      max: 38
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u23',
    name: 'Emma',
    photos: ['https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=600'],
    bio: 'Beach reader and swimmer',
    isCheckedIn: true,
    currentVenue: 'v5',
    currentZone: 'North End',
    zone: 'North End',
    isVisible: true,
    interests: ['reading', 'swimming'],
    gender: 'female',
    interestedIn: ['male'],
    age: 29,
    ageRangePreference: {
      min: 27,
      max: 40
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u24',
    name: 'Tom',
    photos: ['https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600'],
    bio: 'Passionate surfer and coffee lover',
    isCheckedIn: true,
    currentVenue: 'v5',
    currentZone: 'Café Area',
    zone: 'Café Area',
    isVisible: true,
    interests: ['surfing', 'coffee'],
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
  },
  {
    id: 'u25',
    name: 'Lily',
    photos: ['https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=600'],
    bio: 'Plant enthusiast and nature photographer',
    isCheckedIn: true,
    currentVenue: 'v6',
    currentZone: 'Rose Garden',
    zone: 'Rose Garden',
    isVisible: true,
    interests: ['plants', 'photography'],
    gender: 'female',
    interestedIn: ['male', 'female'],
    age: 28,
    ageRangePreference: {
      min: 25,
      max: 38
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
  },
  {
    id: 'u26',
    name: 'Nathan',
    photos: ['https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?w=600'],
    bio: 'Botanist and meditation enthusiast',
    isCheckedIn: true,
    currentVenue: 'v6',
    currentZone: 'Main Lawn',
    zone: 'Main Lawn',
    isVisible: true,
    interests: ['botany', 'meditation'],
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
    id: 'u27',
    name: 'Grace',
    photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600'],
    bio: 'Avid reader and picnic lover',
    isCheckedIn: true,
    currentVenue: 'v6',
    currentZone: 'Pond Area',
    zone: 'Pond Area',
    isVisible: true,
    interests: ['reading', 'picnics'],
    gender: 'female',
    interestedIn: ['male'],
    age: 27,
    ageRangePreference: {
      min: 25,
      max: 35
    },
    matches: [],
    likedUsers: [],
    blockedUsers: []
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
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3 // Expires in 3 hours
  },
  {
    id: 'i2',
    fromUserId: 'u2',
    toUserId: 'u1',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 3, // 3 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3 // Expires in 3 hours
  },
  {
    id: 'i3',
    fromUserId: 'u3',
    toUserId: 'u4',
    venueId: 'v2',
    timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3 // Expires in 3 hours
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
    expiresAt: Date.now() + 1000 * 60 * 60 * 3, // Expires in 3 hours
    contactShared: false
  }
];

// Get users at a venue - Enhanced to ensure we always return results
export const getUsersAtVenue = (venueId: string): User[] => {
  console.log(`Getting users for venue ${venueId}`);
  const venueUsers = users.filter(user => user.currentVenue === venueId && user.isVisible);
  console.log(`Found ${venueUsers.length} users at venue ${venueId}`);
  return venueUsers;
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
