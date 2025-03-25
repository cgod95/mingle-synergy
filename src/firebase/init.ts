
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Use development configuration for the AI editor
const firebaseConfig = {
  // Use default values for development in the AI editor
  apiKey: "AIzaSyDeveloperKey123456789",
  authDomain: "mingle-dev.firebaseapp.com",
  projectId: "mingle-dev",
  storageBucket: "mingle-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
  measurementId: "G-DEV123456"
};

// For development only - use mock services
const USE_MOCK = true;

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
