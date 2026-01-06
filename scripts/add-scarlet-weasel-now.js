/**
 * Quick script to add Scarlet Weasel venue to Firestore
 * Uses existing Firebase config from the project
 * Run: node scripts/add-scarlet-weasel-now.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
    return env;
  } catch (error) {
    console.warn('Could not read .env file, using defaults');
    return {};
  }
}

const env = loadEnv();

// Firebase config from .env
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing Firebase config!');
  console.error('   Make sure .env has VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addScarletWeaselVenue() {
  try {
    console.log('🍺 Adding Scarlet Weasel Redfern to Firestore...');
    console.log(`   Project: ${firebaseConfig.projectId}`);

    // Scarlet Weasel Redfern details
    // Address: 169 Regent St, Redfern NSW 2016, Australia
    const venue = {
      id: 'scarlet-weasel-redfern',
      name: 'Scarlet Weasel',
      type: 'bar',
      address: '169 Regent St',
      city: 'Redfern',
      state: 'NSW',
      postcode: '2016',
      country: 'Australia',
      latitude: -33.8925,
      longitude: 151.2044,
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=800&fit=crop&q=80',
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

    // Add venue to Firestore (merge: true will update if exists)
    const venueRef = doc(collection(db, 'venues'), venue.id);
    await setDoc(venueRef, venue, { merge: true });

    console.log('✅ Successfully added Scarlet Weasel Redfern venue!');
    console.log(`   Venue ID: ${venue.id}`);
    console.log(`   Name: ${venue.name}`);
    console.log(`   Address: ${venue.address}, ${venue.city}`);
    console.log(`   Coordinates: ${venue.latitude}, ${venue.longitude}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Verify the venue in Firebase Console → Firestore → venues');
    console.log('   2. Ensure VITE_DEMO_MODE=false in Vercel');
    console.log('   3. Test check-in flow in your app');
    
  } catch (error) {
    console.error('❌ Error adding venue:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your Firestore security rules allow writes');
    console.error('   2. Verify Firebase config in .env is correct');
    console.error('   3. Try adding manually via Firebase Console');
    console.error('\n   Error details:', error);
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

