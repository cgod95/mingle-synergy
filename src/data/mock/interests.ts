
import { Interest } from '@/types';

export const mockInterests: Interest[] = [
  {
    id: 'i1',
    fromUserId: 'u1',
    toUserId: 'u2',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 // 24 hours from now
  },
  {
    id: 'i2',
    fromUserId: 'u2',
    toUserId: 'u1',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 20, // 20 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 // 24 hours from now
  }
];

// Check if there is a mutual interest
export const hasMutualInterest = (userId: string, otherUserId: string): boolean => {
  const userInterested = mockInterests.some(
    interest => interest.fromUserId === userId && interest.toUserId === otherUserId && interest.isActive
  );
  
  const otherUserInterested = mockInterests.some(
    interest => interest.fromUserId === otherUserId && interest.toUserId === userId && interest.isActive
  );
  
  return userInterested && otherUserInterested;
};

export default mockInterests;
