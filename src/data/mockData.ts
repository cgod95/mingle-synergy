// src/data/mockData.ts

import { UserProfile } from '@/types/UserProfile';
import { Venue } from '@/types/Venue';
import { Match } from '@/types/match.types';

export const users: UserProfile[] = [
  {
    id: 'user1',
    name: 'Alice',
    age: 28,
    bio: 'Love art and live music',
    photos: ['https://randomuser.me/api/portraits/women/1.jpg'],
    gender: 'female',
    interests: ['music', 'theatre'],
    isCheckedIn: true,
    currentVenue: 'venue1',
    currentZone: 'bar',
    zone: 'bar',
    isVisible: true,
  },
  {
    id: 'user2',
    name: 'Bob',
    age: 30,
    bio: 'Always up for a laugh and a pint.',
    photos: ['https://randomuser.me/api/portraits/men/2.jpg'],
    gender: 'male',
    interests: ['comedy', 'drinks'],
    isCheckedIn: true,
    currentVenue: 'venue1',
    currentZone: 'bar',
    zone: 'bar',
    isVisible: true,
  },
];

export const venues: Venue[] = [
  {
    id: 'venue1',
    name: 'The Laughing Pint',
    description: 'A local pub hosting stand-up nights and quiz evenings.',
    location: '123 Comedy St, Melbourne',
    address: '123 Comedy St, Melbourne',
    type: 'bar',
    image: 'https://source.unsplash.com/random/400x300/?bar',
    checkInCount: 2,
    isVisible: true,
    interests: ['comedy', 'drinks'],
    expiryTime: Date.now() + 1000 * 60 * 60 * 3,
  },
];

export const matches: Match[] = [
  {
    id: 'match1',
    userId: 'user1',
    user2Id: 'user2',
    timestamp: Date.now(),
  },
];