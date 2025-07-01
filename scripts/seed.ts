// scripts/seed.ts
// Run with: npx ts-node scripts/seed.ts (after installing ts-node and firebase-admin)

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Only run in dev/emulator or non-production!
if (process.env.NODE_ENV === 'production') {
  throw new Error('Do not run the seeding script in production!');
}

// You can use applicationDefault() if running with GOOGLE_APPLICATION_CREDENTIALS set
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function seed() {
  // Test users
  const users = [
    { id: 'testuser1', name: 'Alice Test', email: 'alice@example.com' },
    { id: 'testuser2', name: 'Bob Test', email: 'bob@example.com' },
  ];

  for (const user of users) {
    await db.collection('users').doc(user.id).set({
      ...user,
      bio: 'Seeded user',
      isCheckedIn: false,
      isVisible: true,
      interests: [],
      gender: 'other',
      interestedIn: ['female', 'male', 'non-binary', 'other'],
      age: 25,
      ageRangePreference: { min: 18, max: 99 },
      matches: [],
      likedUsers: [],
      blockedUsers: [],
      photos: [],
    });
  }

  // Venues
  const venues = [
    { id: 'venue1', name: 'Test Cafe', address: '123 Main St', city: 'Testville', latitude: 0, longitude: 0, type: 'cafe', checkInCount: 0, expiryTime: Date.now() + 3600 * 1000, zones: ['A', 'B'], image: '' },
    { id: 'venue2', name: 'Test Bar', address: '456 Side St', city: 'Testville', latitude: 0, longitude: 0, type: 'bar', checkInCount: 0, expiryTime: Date.now() + 3600 * 1000, zones: ['Main'], image: '' },
  ];
  for (const venue of venues) {
    await db.collection('venues').doc(venue.id).set(venue);
  }

  // Check-ins
  await db.collection('checkins').add({ userId: 'testuser1', venueId: 'venue1', timestamp: Date.now() });
  await db.collection('checkins').add({ userId: 'testuser2', venueId: 'venue2', timestamp: Date.now() });

  // Matches
  const matchId = `match_${Date.now()}`;
  await db.collection('matches').doc(matchId).set({
    id: matchId,
    userId1: 'testuser1',
    userId2: 'testuser2',
    venueId: 'venue1',
    timestamp: Date.now(),
    isActive: true,
    expiresAt: Date.now() + 3 * 3600 * 1000,
    contactShared: false,
  });

  // Messages (as subcollection)
  await db.collection('matches').doc(matchId).collection('messages').add({
    senderId: 'testuser1',
    text: 'Hello from Alice!',
    timestamp: Date.now(),
  });
  await db.collection('matches').doc(matchId).collection('messages').add({
    senderId: 'testuser2',
    text: 'Hi Alice, this is Bob!',
    timestamp: Date.now(),
  });

  console.log('Seeding complete!');
}

seed().catch(console.error); 