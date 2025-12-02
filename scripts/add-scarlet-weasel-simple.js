/**
 * Simple script to add Scarlet Weasel Redfern venue to Firestore
 * Uses Firebase client SDK (no admin SDK needed)
 * 
 * Usage:
 * 1. Set your Firebase config in .env or update the config below
 * 2. Run: node scripts/add-scarlet-weasel-simple.js
 * 
 * Or use Firebase Console manually (see add-scarlet-weasel-manual.md)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase config - update with your actual values
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:123:web:abc',
};

const app = initializeApp(firebaseConfig);
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
      image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop',
      checkInCount: 0,
      expiryTime: 120, // 2 hours
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

    // Add venue to Firestore
    const venueRef = doc(collection(db, 'venues'), venue.id);
    await setDoc(venueRef, venue);

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
    console.error('   1. Make sure Firebase config is correct');
    console.error('   2. Check your Firestore security rules allow writes');
    console.error('   3. Try adding manually via Firebase Console (see add-scarlet-weasel-manual.md)');
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

