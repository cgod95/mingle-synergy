// 🧠 Purpose: Firebase core configuration and exports for use across the app.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Your hardcoded prod config
const firebaseConfig = {
  apiKey: "AIzaSyBKTX6N5AIeVvQhQIz_kAwNe6o3RYXl5vA",
  authDomain: "mingle-a12a2.firebaseapp.com",
  projectId: "mingle-a12a2",
  storageBucket: "mingle-a12a2.appspot.com",
  messagingSenderId: "412919211446",
  appId: "1:412919211446:web:7e68a7d9bf4ed1af860d17",
  measurementId: "G-FSCE44K0P6"
};

// ✅ Initialize Firebase services (guarded)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// ✅ Export all required Firebase modules
export { auth, firestore, storage };