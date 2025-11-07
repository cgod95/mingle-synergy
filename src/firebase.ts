import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Read config from env (fallbacks keep demo mode from crashing)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123:web:demo",
};

// Singleton app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Core SDKs
const auth = getAuth(app);
const db = getFirestore(app);
const firestore = db; // Alias for compatibility
const storage = getStorage(app);

// Optional: connect to emulators if requested
const useEmu = import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";
if (useEmu) {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
  } catch {}
  try {
    const port = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT) || 8082;
    connectFirestoreEmulator(db, "127.0.0.1", port);
  } catch {}
}

export { app, auth, db, firestore, storage };
