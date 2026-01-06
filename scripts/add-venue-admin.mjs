/**
 * Add venue to Firestore using Firebase Admin SDK
 * 
 * Setup (one-time):
 * 1. Go to Firebase Console → Project Settings → Service accounts
 * 2. Click "Generate new private key"
 * 3. Save as: scripts/serviceAccountKey.json
 * 
 * Usage:
 *   node scripts/add-venue-admin.mjs
 *   node scripts/add-venue-admin.mjs scripts/my-venue.json
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to service account key
const SERVICE_ACCOUNT_PATH = join(__dirname, 'serviceAccountKey.json');

// Check if service account exists
if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ Service account key not found!');
  console.error('\n📝 Setup instructions:');
  console.error('   1. Go to Firebase Console → ⚙️ Project Settings → Service accounts');
  console.error('   2. Click "Generate new private key"');
  console.error('   3. Save the file as: scripts/serviceAccountKey.json');
  console.error('\n⚠️  This file is already in .gitignore (safe to add)');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});
const db = getFirestore(app);

console.log(`📦 Connected to Firebase project: ${serviceAccount.project_id}`);

// Default venue data (Scarlet Weasel)
const defaultVenue = {
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
  expiryTime: 120,
  zones: ['main', 'outdoor', 'back'],
  checkedInUsers: [],
  specials: [
    { title: 'Happy Hour', description: '5-7pm Daily' },
    { title: 'Live Music', description: 'Fridays & Saturdays' }
  ],
  description: 'A cozy bar in the heart of Redfern',
};

// Load venue from JSON file if provided
let venue = defaultVenue;
const customVenuePath = process.argv[2];

if (customVenuePath) {
  try {
    const customVenue = JSON.parse(readFileSync(customVenuePath, 'utf-8'));
    venue = { ...defaultVenue, ...customVenue };
    console.log(`📄 Loaded venue data from: ${customVenuePath}`);
  } catch (err) {
    console.error(`❌ Failed to load venue from ${customVenuePath}:`, err.message);
    process.exit(1);
  }
}

// Add venue to Firestore
async function addVenue() {
  try {
    console.log(`\n🍺 Adding venue: ${venue.name}`);
    console.log(`   Address: ${venue.address}, ${venue.city}`);
    console.log(`   ID: ${venue.id}`);

    // Add timestamps
    const venueData = {
      ...venue,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Write to Firestore
    await db.collection('venues').doc(venue.id).set(venueData, { merge: true });

    console.log('\n✅ Venue added successfully!');
    console.log(`\n📍 View in Firebase Console:`);
    console.log(`   https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore/data/~2Fvenues~2F${venue.id}`);
    
  } catch (error) {
    console.error('\n❌ Error adding venue:', error.message);
    process.exit(1);
  }
}

addVenue().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});

