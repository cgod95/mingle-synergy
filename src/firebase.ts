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
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'localhost',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:abcdef123456',
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// ✅ Connect to emulators only if running on localhost
if (typeof window !== 'undefined' && location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9091');
  } catch (e) {
    const error = e as Error;
    if (error.message?.includes('already connected')) {
      // Emulator already connected, ignore
    } else {
      console.error('Auth emulator error:', e);
    }
  }

  try {
    connectFirestoreEmulator(firestore, 'localhost', 8081);
  } catch (e) {
    const error = e as Error;
    if (error.message?.includes('already connected')) {
      // Emulator already connected, ignore
    } else {
      console.error('Firestore emulator error:', e);
    }
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9198);
  } catch (e) {
    const error = e as Error;
    if (error.message?.includes('already connected')) {
      // Emulator already connected, ignore
    } else {
      console.error('Storage emulator error:', e);
    }
  }
}

// ✅ Export services
export { app, auth, firestore, storage };