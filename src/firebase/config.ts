
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if we have valid config
let app;
let auth;
let db;
let storage;
let analytics = null;
let firestore;

// Only initialize if we have an API key
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key') {
  try {
    // Initialize Firebase (only once)
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    firestore = db; // For backward compatibility
    storage = getStorage(app);
    
    // Initialize analytics only in browser environment
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    
    console.log('Firebase initialized successfully');
  } catch (e) {
    console.error('Firebase initialization error:', e);
    
    // Create empty objects for mock mode
    app = {};
    auth = {};
    db = {};
    firestore = {};
    storage = {};
  }
} else {
  console.warn('Firebase configuration not found or incomplete, using mock services');
  
  // Create empty objects for mock mode
  app = {};
  auth = {};
  db = {};
  firestore = {};
  storage = {};
}

// Export mock status for service determination
const isMock = Object.keys(app).length === 0;

export { app, auth, db, storage, analytics, firestore, isMock };
