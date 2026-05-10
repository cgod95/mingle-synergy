import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { initializeFirestore, getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import config from "@/config";

const isDev = !import.meta.env.PROD;

// BETA FIX: Only use config.DEMO_MODE (no development fallback)
// This ensures Firebase initializes in development when DEMO_MODE is not explicitly set
const isDemoMode = config.DEMO_MODE;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// In demo mode, don't initialize Firebase at all - components will handle null auth
if (!isDemoMode && config.FIREBASE_API_KEY && config.FIREBASE_PROJECT_ID) {
  try {
    const firebaseConfig = {
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID,
      measurementId: config.FIREBASE_MEASUREMENT_ID,
    };

    if (isDev) console.log('[Firebase] Initializing with project:', config.FIREBASE_PROJECT_ID);

    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    // Use initializeAuth with persistent storage for Capacitor (iOS/Android)
    try {
      auth = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      });
    } catch {
      auth = getAuth(app);
    }
    try {
      // experimentalForceLongPolling kept on for Capacitor/iOS WebKit which
      // can have spotty WebChannel/WebSocket support. Removing it would speed
      // up Firestore on web but risks breaking native iOS realtime listeners.
      firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch {
      firestore = getFirestore(app);
    }
    storage = getStorage(app);

    if (isDev) console.log('[Firebase] Initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else if (isDev) {
  console.log('[Firebase] Skipped initialization - isDemoMode:', isDemoMode, 'hasApiKey:', !!config.FIREBASE_API_KEY, 'hasProjectId:', !!config.FIREBASE_PROJECT_ID);
}

// let analytics: ReturnType<typeof getAnalytics> | undefined;
// isSupported().then((yes) => {
//   if (yes) {
//     analytics = getAnalytics(app);
//   }
// });

// Export db as alias for firestore for backward compatibility
const db = firestore;

export { app, auth, firestore, storage, db };
