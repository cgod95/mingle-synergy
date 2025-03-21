
// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmxiZyipxFLSNu9p4LwiKBRvF87WyGEXU",
  authDomain: "mingle-95c7f.firebaseapp.com",
  projectId: "mingle-95c7f",
  storageBucket: "mingle-95c7f.firebasestorage.app",
  messagingSenderId: "465247994931",
  appId: "1:465247994931:web:35d6531af07f4a0ea00f46",
  measurementId: "G-Z2V26PDRPV"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
