
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
  }
];

// Get a user's matches
export const getUserMatches = (userId: string): Match[] => {
  return mockMatches.filter(
    match => (match.userId === userId || match.matchedUserId === userId) && match.isActive
  );
};

export default mockMatches;
