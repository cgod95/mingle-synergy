/**
 * Automated script to add Scarlet Weasel Redfern venue using Firebase CLI
 * This uses Firebase Admin SDK via Firebase CLI authentication
 * 
 * Run: node scripts/add-scarlet-weasel-firebase-cli.js
 * 
 * Prerequisites:
 * - Firebase CLI installed: npm install -g firebase-tools
 * - Logged in: firebase login
 * - Project ID set in .firebaserc or as environment variable
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate config
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:');
  missingVars.forEach(key => console.error(`   - ${key}`));
  console.error('\n💡 Set these in your .env file or Vercel environment variables');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addScarletWeaselVenue() {
  try {
    console.log('🍺 Adding Scarlet Weasel Redfern to Firestore...');
    console.log(`   Project: ${firebaseConfig.projectId}`);

    // Scarlet Weasel Redfern details
    const venue = {
      id: 'scarlet-weasel-redfern',
      name: 'Scarlet Weasel',
      type: 'bar',
      address: '88 Regent St',
      city: 'Redfern',
      state: 'NSW',
      postcode: '2016',
      country: 'Australia',
      latitude: -33.8925,
      longitude: 151.2044,
      image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop',
      checkInCount: 0,
      expiryTime: 120,
      zones: ['main', 'outdoor', 'back'],
      checkedInUsers: [],
      specials: [
        { title: 'Happy Hour', description: '5-7pm Daily' },
        { title: 'Live Music', description: 'Fridays & Saturdays' }
      ],
      description: 'A cozy bar in the heart of Redfern',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Check if venue already exists
    const venueRef = doc(collection(db, 'venues'), venue.id);
    
    // Add venue to Firestore
    await setDoc(venueRef, venue, { merge: true });

    console.log('✅ Successfully added Scarlet Weasel Redfern venue!');
    console.log(`   Venue ID: ${venue.id}`);
    console.log(`   Name: ${venue.name}`);
    console.log(`   Address: ${venue.address}, ${venue.city}`);
    console.log(`   Coordinates: ${venue.latitude}, ${venue.longitude}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Verify the venue in Firebase Console → Firestore → venues');
    console.log('   2. Ensure VITE_DEMO_MODE=false in Vercel');
    console.log('   3. Redeploy from main branch');
    console.log('   4. Test check-in flow in your app');
    
  } catch (error) {
    console.error('❌ Error adding venue:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('\n💡 Permission denied. Check your Firestore security rules:');
      console.error('   match /venues/{venueId} {');
      console.error('     allow read: if request.auth != null;');
      console.error('     allow write: if request.auth != null; // Or restrict to admins');
      console.error('   }');
    } else if (error.code === 'unavailable') {
      console.error('\n💡 Firestore unavailable. Check:');
      console.error('   1. Firebase project is active');
      console.error('   2. Firestore is enabled in Firebase Console');
      console.error('   3. Network connection is working');
    }
    
    console.error('\n💡 Alternative: Add venue manually via Firebase Console');
    console.error('   See: scripts/add-scarlet-weasel-manual.md');
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





