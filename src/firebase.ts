// src/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';
import {
  connectAuthEmulator,
  getAuth,
} from 'firebase/auth';

// ✅ Replace with your actual Firebase config
const firebaseConfig = {
  projectId: 'demo-mingle',
  appId: 'demo-app-id',
  apiKey: 'fake-api-key',
  authDomain: 'localhost',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 👇 Emulator connections
if (typeof window !== 'undefined' && location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9091');
  connectFirestoreEmulator(db, 'localhost', 8081);
}

export { auth, db };