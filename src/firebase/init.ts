
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeveloperKey123456789", // This is a development key
  authDomain: "mingle-dev.firebaseapp.com",
  projectId: "mingle-dev",
  storageBucket: "mingle-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
  measurementId: "G-DEV123456"
};

// Always use mock services in development
const USE_MOCK = true;

let app = null;
let auth = null;
let db = null;
let storage = null;

if (!USE_MOCK) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Fall back to mock objects
    app = {} as any;
    auth = {} as any;
    db = {} as any;
    storage = {} as any;
  }
} else {
  console.log('Using mock services for development');
  app = {} as any;
  auth = {} as any;
  db = {} as any;
  storage = {} as any;
}

export { app, auth, db, storage };
