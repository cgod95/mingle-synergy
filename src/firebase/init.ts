
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDeveloperKey123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mingle-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mingle-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mingle-dev.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abc123def456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DEV123456"
};

// Set to false to use real Firebase services instead of mocks
const USE_MOCK = false;

let app = null;
let auth = null;
let db = null;
let storage = null;

if (!USE_MOCK) {
  try {
    // Initialize Firebase only if not using mock services
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Fall back to mock objects if Firebase initialization fails
    app = {} as any;
    auth = {} as any;
    db = {} as any;
    storage = {} as any;
  }
} else {
  // Create mock objects
  app = {} as any;
  auth = {} as any;
  db = {} as any;
  storage = {} as any;
}

export { app, auth, db, storage };
