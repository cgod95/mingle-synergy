import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import config from "@/config";
// import { getAnalytics, isSupported } from "firebase/analytics";

// Check if we're in demo mode
// BETA FIX: Only use config.DEMO_MODE (no development fallback)
// This ensures Firebase initializes in development when DEMO_MODE is not explicitly set
const isDemoMode = config.DEMO_MODE;

let app: any = null;
let auth: any = null;
let firestore: any = null;
let storage: any = null;

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

    // Log Firebase project for debugging permission issues
    console.log('[Firebase] Initializing with project:', config.FIREBASE_PROJECT_ID);

    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    // Use initializeAuth with persistent storage for Capacitor (iOS/Android)
    // indexedDBLocalPersistence survives app backgrounding; browserLocalPersistence is fallback
    try {
      auth = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      });
    } catch {
      // If auth was already initialized (e.g. hot reload), fall back to getAuth
      auth = getAuth(app);
    }
    try {
      firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch {
      firestore = getFirestore(app);
    }
    storage = getStorage(app);
    
    console.log('[Firebase] Initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
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
