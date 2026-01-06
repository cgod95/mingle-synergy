/**
 * Add Scarlet Weasel venue using known Firebase project
 * Project: mingle-a12a2 (from firebase use)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// We know the project ID from firebase use output
const PROJECT_ID = 'mingle-a12a2';

console.log('📦 Using Firebase project:', PROJECT_ID);
console.log('⚠️  Note: This requires Firebase config from .env');
console.log('   If this fails, you may need to add venue manually via Firebase Console\n');

// Try to get config from environment or use project ID to construct
// For Firestore writes, we mainly need projectId, but API key helps
const firebaseConfig = {
  projectId: PROJECT_ID,
  // These will be read from process.env if available
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || `${PROJECT_ID}.firebaseapp.com`,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:123:web:abc',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

try {
  console.log('🍺 Adding Scarlet Weasel to Firestore...');
  const venueRef = doc(db, 'venues', venue.id);
  await setDoc(venueRef, venue, { merge: true });
  
  console.log('✅ Successfully added!');
  console.log(`   Venue: ${venue.name}`);
  console.log(`   Address: ${venue.address}, ${venue.city}`);
  console.log(`   Document ID: ${venue.id}`);
  console.log('\n📝 Verify in Firebase Console:');
  console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/~2Fvenues~2F${venue.id}`);
  console.log('\n✨ Done! The venue should now appear in your app.');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\n💡 Options:');
  console.error('   1. Add manually via Firebase Console (fastest)');
  console.error('   2. Check Firestore security rules allow writes');
  console.error('   3. Verify Firebase config in .env');
  console.error('\n   Manual method: See scripts/add-scarlet-weasel-manual.md');
  process.exit(1);
}

