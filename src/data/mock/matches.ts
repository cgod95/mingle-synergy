import { Match } from '@/types';

export const mockMatches: Match[] = [
  {
    id: 'm1',
    userId: 'u1',
    matchedUserId: 'u2',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3, // 3 hours from now
    contactShared: false
  },
  {
    id: 'm2',
    userId: 'u1',
    matchedUserId: 'u3',
    venueId: 'v2',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm3',
    userId: 'u2',
    matchedUserId: 'u4',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm4',
    userId: 'u3',
    matchedUserId: 'u5',
    venueId: 'v3',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm5',
    userId: 'u4',
    matchedUserId: 'u6',
    venueId: 'v2',
    timestamp: Date.now() - 1000 * 60 * 20, // 20 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm6',
    userId: 'u5',
    matchedUserId: 'u7',
    venueId: 'v4',
    timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm7',
    userId: 'u6',
    matchedUserId: 'u8',
    venueId: 'v5',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm8',
    userId: 'u7',
    matchedUserId: 'u9',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 25, // 25 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm9',
    userId: 'u8',
    matchedUserId: 'u10',
    venueId: 'v2',
    timestamp: Date.now() - 1000 * 60 * 50, // 50 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm10',
    userId: 'u9',
    matchedUserId: 'u11',
    venueId: 'v3',
    timestamp: Date.now() - 1000 * 60 * 35, // 35 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm11',
    userId: 'u10',
    matchedUserId: 'u12',
    venueId: 'v4',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm12',
    userId: 'u11',
    matchedUserId: 'u13',
    venueId: 'v5',
    timestamp: Date.now() - 1000 * 60 * 55, // 55 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm13',
    userId: 'u12',
    matchedUserId: 'u14',
    venueId: 'v6',
    timestamp: Date.now() - 1000 * 60 * 40, // 40 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm14',
    userId: 'u13',
    matchedUserId: 'u15',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 12, // 12 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm15',
    userId: 'u14',
    matchedUserId: 'u16',
    venueId: 'v2',
    timestamp: Date.now() - 1000 * 60 * 8, // 8 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm16',
    userId: 'u15',
    matchedUserId: 'u16',
    venueId: 'v3',
    timestamp: Date.now() - 1000 * 60 * 3, // 3 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  }
];

// Get a user's matches
export const getUserMatches = (userId: string): Match[] => {
  return mockMatches.filter(
    match => (match.userId === userId || match.matchedUserId === userId) && match.isActive
  );
};

export default mockMatches;
