/**
 * Direct script to add Scarlet Weasel venue
 * Uses Firebase web SDK with proper env loading
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
function loadEnv() {
  const env = {};
  try {
    const envPath = join(__dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          env[key.trim()] = value;
        }
      }
    });
  } catch (err) {
    console.warn('Could not read .env:', err.message);
  }
  return env;
}

const env = loadEnv();

// Get Firebase config
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// Validate
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing Firebase config in .env');
  console.error('   Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID');
  console.error(`   Found API Key: ${!!firebaseConfig.apiKey}`);
  console.error(`   Found Project ID: ${!!firebaseConfig.projectId}`);
  process.exit(1);
}

console.log(`📦 Using Firebase project: ${firebaseConfig.projectId}`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Venue data
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

// Add to Firestore
try {
  console.log('🍺 Adding Scarlet Weasel to Firestore...');
  const venueRef = doc(db, 'venues', venue.id);
  await setDoc(venueRef, venue, { merge: true });
  
  console.log('✅ Successfully added!');
  console.log(`   Venue: ${venue.name}`);
  console.log(`   Address: ${venue.address}, ${venue.city}`);
  console.log(`   ID: ${venue.id}`);
  console.log('\n📝 Verify in Firebase Console:');
  console.log(`   https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data/~2Fvenues~2F${venue.id}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.code === 'permission-denied') {
    console.error('\n💡 Firestore security rules may be blocking writes.');
    console.error('   Check your firestore.rules file allows writes to venues collection.');
  }
  process.exit(1);
}

