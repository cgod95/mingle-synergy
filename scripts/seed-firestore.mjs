import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const app = initializeApp({ projectId: 'demo-mingle' });
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8082);

async function run() {
  // Venue
  await setDoc(doc(db, 'venues', 'demo-venue'), {
    name: 'Demo Bar',
    city: 'London',
    active: true,
    createdAt: serverTimestamp()
  });

  // User profiles (adjust IDs/shape to match your UI expectations)
  await setDoc(doc(db, 'users', 'userA'), {
    displayName: 'Alice',
    email: 'a@test.com',
    checkedInVenueId: 'demo-venue',
    isCheckedIn: true,
    checkedInAt: Date.now()
  });
  await setDoc(doc(db, 'users', 'userB'), {
    displayName: 'Bob',
    email: 'b@test.com',
    checkedInVenueId: 'demo-venue',
    isCheckedIn: true,
    checkedInAt: Date.now()
  });

  // Optional: mutual likes (adjust to your schema)
  await setDoc(doc(db, 'likes', 'userA_userB'), {
    from: 'userA',
    to: 'userB',
    venueId: 'demo-venue',
    createdAt: serverTimestamp()
  });
  await setDoc(doc(db, 'likes', 'userB_userA'), {
    from: 'userB',
    to: 'userA',
    venueId: 'demo-venue',
    createdAt: serverTimestamp()
  });

  console.log('Seeded: venue + users + likes');
}
run().catch(err => (console.error(err), process.exit(1)));
