import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

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

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

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
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
} else {
  console.log('Using mock services for development');
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export { app, auth, db, storage };
