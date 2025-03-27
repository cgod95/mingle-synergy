
import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Lazy loading Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

// Initialize Firebase on demand, not immediately
const initializeFirebase = (): boolean => {
  try {
    if (app) return true; // Already initialized
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    
    // Check for valid config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Invalid Firebase config');
      return false;
    }
    
    // Initialize Firebase app
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    console.log('Firebase app initialized');
    
    return true;
  } catch (error) {
    console.error('Error initializing Firebase app:', error);
    return false;
  }
};

// Safely get Firestore instance
export const getDB = (): Firestore | null => {
  try {
    if (!initializeFirebase()) return null;
    if (!db) db = getFirestore(app!);
    return db;
  } catch (error) {
    console.error('Error getting Firestore:', error);
    return null;
  }
};

// Safely get Auth instance
export const getAUTH = (): Auth | null => {
  try {
    if (!initializeFirebase()) return null;
    if (!auth) auth = getAuth(app!);
    return auth;
  } catch (error) {
    console.error('Error getting Auth:', error);
    return null;
  }
};

// Safely get Storage instance
export const getSTORAGE = (): FirebaseStorage | null => {
  try {
    if (!initializeFirebase()) return null;
    if (!storage) storage = getStorage(app!);
    return storage;
  } catch (error) {
    console.error('Error getting Storage:', error);
    return null;
  }
};

// Check if Firebase is available
export const isFirebaseAvailable = (): boolean => {
  return initializeFirebase();
};
