/**
 * Script to add Scarlet Weasel Redfern venue to Firestore
 * Run with: npx tsx scripts/add-scarlet-weasel-venue.ts
 * 
 * Make sure you have Firebase Admin SDK credentials set up:
 * - Set GOOGLE_APPLICATION_CREDENTIALS environment variable, OR
 * - Use Firebase CLI: firebase login
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin (use existing app if already initialized)
let app;
if (getApps().length === 0) {
  // Option 1: Use service account from environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });
  } else {
    // Option 2: Use default credentials (Firebase CLI login)
    app = initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
    });
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

async function addScarletWeaselVenue() {
  try {
    console.log('🍺 Adding Scarlet Weasel Redfern to Firestore...');

    // Scarlet Weasel Redfern details
    // Address: 88 Regent St, Redfern NSW 2016, Australia
    // Coordinates: Redfern area (approximate: -33.8925, 151.2044)
    const venue = {
      id: 'scarlet-weasel-redfern',
      name: 'Scarlet Weasel',
      type: 'bar',
      address: '88 Regent St',
      city: 'Redfern',
      state: 'NSW',
      postcode: '2016',
      country: 'Australia',
      latitude: -33.8925, // Redfern coordinates
      longitude: 151.2044,
      image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop', // Bar image
      checkInCount: 0,
      expiryTime: 120, // 2 hours
      zones: ['main', 'outdoor', 'back'],
      checkedInUsers: [],
      specials: [
        { title: 'Happy Hour', description: '5-7pm Daily' },
        { title: 'Live Music', description: 'Fridays & Saturdays' }
      ],
      description: 'A cozy bar in the heart of Redfern',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Add venue to Firestore
    await db.collection('venues').doc(venue.id).set(venue);

    console.log('✅ Successfully added Scarlet Weasel Redfern venue!');
    console.log(`   Venue ID: ${venue.id}`);
    console.log(`   Name: ${venue.name}`);
    console.log(`   Address: ${venue.address}, ${venue.city}`);
    console.log(`   Coordinates: ${venue.latitude}, ${venue.longitude}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Verify the venue appears in Firebase Console');
    console.log('   2. Ensure VITE_DEMO_MODE=false in Vercel');
    console.log('   3. Test check-in flow in your app');
    
  } catch (error) {
    console.error('❌ Error adding venue:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure Firebase Admin SDK is set up');
    console.error('   2. Check your Firebase project ID is correct');
    console.error('   3. Ensure you have write permissions to Firestore');
    console.error('   4. Try: firebase login (if using Firebase CLI)');
    process.exit(1);
  }
}

// Run the script
addScarletWeaselVenue()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });





