
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAmxiZyipxFLSNu9p4LwiKBRvF87WyGEXU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mingle-95c7f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mingle-95c7f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mingle-95c7f.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "465247994931",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:465247994931:web:35d6531af07f4a0ea00f46",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Z2V26PDRPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Enable offline persistence for better mobile experience
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(firestore)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all features required for persistence');
      }
    });
}

export default app;
