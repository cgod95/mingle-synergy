// scripts/seed.cjs
// Run with: node scripts/seed.cjs (after installing firebase-admin)

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Only run in dev/emulator or non-production!
if (process.env.NODE_ENV === 'production') {
  throw new Error('Do not run the seeding script in production!');
}

// Initialize Firebase Admin with explicit project configuration
initializeApp({
  credential: applicationDefault(),
  projectId: 'mingle-a12a2', // Your Firebase project ID from service account
});

const db = getFirestore();

async function seed() {
  try {
    console.log('Starting Firestore seeding...');
    
    // Test users
    const users = [
      { id: 'testuser1', name: 'Alice Test', email: 'alice@example.com' },
      { id: 'testuser2', name: 'Bob Test', email: 'bob@example.com' },
    ];

    console.log('Creating test users...');
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created user: ${user.name}`);
    }

    // Venues
    const venues = [
      { id: 'venue1', name: 'Test Cafe', address: '123 Main St', city: 'Testville', latitude: 0, longitude: 0, type: 'cafe', checkInCount: 0, expiryTime: Date.now() + 3600 * 1000, zones: ['A', 'B'], image: '' },
      { id: 'venue2', name: 'Test Bar', address: '456 Side St', city: 'Testville', latitude: 0, longitude: 0, type: 'bar', checkInCount: 0, expiryTime: Date.now() + 3600 * 1000, zones: ['Main'], image: '' },
    ];
    
    console.log('Creating test venues...');
    for (const venue of venues) {
      await db.collection('venues').doc(venue.id).set({
        ...venue,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created venue: ${venue.name}`);
    }

    // Check-ins
    console.log('Creating test check-ins...');
    await db.collection('checkins').add({ 
      userId: 'testuser1', 
      venueId: 'venue1', 
      timestamp: Date.now(),
      createdAt: new Date(),
    });
    await db.collection('checkins').add({ 
      userId: 'testuser2', 
      venueId: 'venue2', 
      timestamp: Date.now(),
      createdAt: new Date(),
    });
    console.log('Created check-ins');

    // Matches
    const matchId = `match_${Date.now()}`;
    console.log('Creating test match...');
    await db.collection('matches').doc(matchId).set({
      id: matchId,
      userId1: 'testuser1',
      userId2: 'testuser2',
      venueId: 'venue1',
      timestamp: Date.now(),
      isActive: true,
      expiresAt: Date.now() + 3 * 3600 * 1000,
      contactShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Created match: ${matchId}`);

    // Messages (as subcollection)
    console.log('Creating test messages...');
    await db.collection('matches').doc(matchId).collection('messages').add({
      senderId: 'testuser1',
      text: 'Hello from Alice!',
      timestamp: Date.now(),
      createdAt: new Date(),
    });
    await db.collection('matches').doc(matchId).collection('messages').add({
      senderId: 'testuser2',
      text: 'Hi Alice, this is Bob!',
      timestamp: Date.now(),
      createdAt: new Date(),
    });
    console.log('Created test messages');

    console.log('✅ Seeding complete!');
    console.log('\nTest data created:');
    console.log('- 2 users (Alice Test, Bob Test)');
    console.log('- 2 venues (Test Cafe, Test Bar)');
    console.log('- 2 check-ins');
    console.log('- 1 match between Alice and Bob');
    console.log('- 2 messages in the match');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed(); 