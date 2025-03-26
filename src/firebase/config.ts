
import { app, auth, db, storage } from './init';
import { getAnalytics } from 'firebase/analytics';

// Export the firebaseConfig from the init file
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize analytics separately
let analytics = null;
try {
  if (typeof window !== 'undefined' && Object.keys(app).length > 0) {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.error('Analytics initialization error:', e);
}

// For backward compatibility
const firestore = db;

// Export mock status for service determination
const isMock = Object.keys(app).length === 0;

export { app, auth, db, storage, analytics, firestore, isMock };
