import { Match } from '@/types';

export const mockMatches: Match[] = [
  {
    id: 'm1',
    userId: 'u1',
    matchedUserId: 'u2',
    venueId: 'v1',
    venueName: 'The Greenhouse Café',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false,
    met: false,
    message: 'Hey! I love the plants here 🌱',
    receivedMessage: 'Me too! Have you tried the matcha latte?'
  },
  {
    id: 'm2',
    userId: 'u1',
    matchedUserId: 'u3',
    venueId: 'v2',
    venueName: 'Bondi Beach Bar',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 30, // 30 minutes from now
    contactShared: false,
    met: false,
    message: 'Surf\'s up! 🏄',
    receivedMessage: 'Always! What\'s your go-to drink here?'
  },
  {
    id: 'm3',
    userId: 'u1',
    matchedUserId: 'u4',
    venueId: 'v3',
    venueName: 'Sunny Courtyard',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 1, // 1 hour from now
    contactShared: false,
    met: false,
    message: '', // No messages yet
    receivedMessage: ''
  },
  {
    id: 'm4',
    userId: 'u1',
    matchedUserId: 'u5',
    venueId: 'v4',
    venueName: 'Opera Bar',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    isActive: false,
    expiresAt: Date.now() - 1000 * 60 * 60 * 1, // expired 1 hour ago
    contactShared: false,
    met: false,
    message: 'Did you catch the jazz set?',
    receivedMessage: 'Yes! The saxophonist was amazing.'
  },
  {
    id: 'm5',
    userId: 'u1',
    matchedUserId: 'u6',
    venueId: 'v5',
    venueName: 'Lune Bakery',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false,
    met: true,
    metAt: Date.now() - 1000 * 60 * 60 * 2, // met 2 hours ago
    message: 'Croissant buddies?',
    receivedMessage: 'Absolutely! Next time, pain au chocolat.'
  },
  {
    id: 'm6',
    userId: 'u1',
    matchedUserId: 'u7',
    venueId: 'v6',
    venueName: 'Gallery Lane',
    timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3, // 3 hours from now
    contactShared: false,
    met: false,
    message: 'If you could buy any piece here, which would it be?',
    receivedMessage: 'The neon cat sculpture, hands down.'
  },
  {
    id: 'm7',
    userId: 'u2',
    matchedUserId: 'u8',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm8',
    userId: 'u3',
    matchedUserId: 'u9',
    venueId: 'v2',
    timestamp: Date.now() - 1000 * 60 * 25, // 25 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm9',
    userId: 'u4',
    matchedUserId: 'u10',
    venueId: 'v3',
    timestamp: Date.now() - 1000 * 60 * 50, // 50 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm10',
    userId: 'u5',
    matchedUserId: 'u11',
    venueId: 'v4',
    timestamp: Date.now() - 1000 * 60 * 35, // 35 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm11',
    userId: 'u6',
    matchedUserId: 'u12',
    venueId: 'v5',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm12',
    userId: 'u7',
    matchedUserId: 'u13',
    venueId: 'v6',
    timestamp: Date.now() - 1000 * 60 * 55, // 55 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm13',
    userId: 'u8',
    matchedUserId: 'u14',
    venueId: 'v1',
    timestamp: Date.now() - 1000 * 60 * 40, // 40 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm14',
    userId: 'u9',
    matchedUserId: 'u15',
    venueId: 'v2',
    timestamp: Date.now() - 1000 * 60 * 12, // 12 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm15',
    userId: 'u10',
    matchedUserId: 'u16',
    venueId: 'v3',
    timestamp: Date.now() - 1000 * 60 * 8, // 8 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm16',
    userId: 'u11',
    matchedUserId: 'u16',
    venueId: 'v4',
    timestamp: Date.now() - 1000 * 60 * 3, // 3 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false
  },
  {
    id: 'm17',
    userId: 'u1',
    matchedUserId: 'u12',
    venueId: 'v7',
    venueName: 'Skyline Rooftop',
    timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
    contactShared: false,
    met: false,
    message: 'This view is unreal! 🌇',
    receivedMessage: 'Right? Wait till the DJ starts.'
  },
  {
    id: 'm18',
    userId: 'u1',
    matchedUserId: 'u13',
    venueId: 'v8',
    venueName: 'Leaf & Letter Bookshop',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    isActive: true,
    expiresAt: Date.now() + 1000 * 60 * 60 * 1, // 1 hour from now
    contactShared: false,
    met: false,
    message: 'Found any hidden gems?',
    receivedMessage: '"So many books, so little time." – Frank Zappa'
  }
];

// --- DYNAMIC MATCH LOGIC FOR DEMO ---
// In-memory dynamic matches (not persisted)
const dynamicMatches: Match[] = [];

// Helper: Add a match for both users if not already matched
export function addMatch(userId: string, matchedUserId: string, venueId: string) {
  // Prevent duplicate matches
  if (isMatch(userId, matchedUserId)) return;
  const now = Date.now();
  const match: Match = {
    id: `dyn_${userId}_${matchedUserId}_${now}`,
    userId,
    matchedUserId,
    venueId,
    timestamp: now,
    isActive: true,
    expiresAt: now + 1000 * 60 * 60 * 24, // 24 hours
    contactShared: false
  };
  dynamicMatches.push(match);
}

// Helper: Check if two users are already matched
export function isMatch(userId: string, matchedUserId: string) {
  return (
    mockMatches.concat(dynamicMatches).some(
      m =>
        ((m.userId === userId && m.matchedUserId === matchedUserId) ||
          (m.userId === matchedUserId && m.matchedUserId === userId)) &&
        m.isActive
    )
  );
}

// Get a user's matches (static + dynamic)
export const getUserMatches = (userId: string): Match[] => {
  return mockMatches
    .concat(dynamicMatches)
    .filter(
      match => (match.userId === userId || match.matchedUserId === userId) && match.isActive
    );
};

export default mockMatches;
