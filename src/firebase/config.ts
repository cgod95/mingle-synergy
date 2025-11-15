import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import config from "@/config";
// import { getAnalytics, isSupported } from "firebase/analytics";

// Check if we're in demo mode
const isDemoMode = config.DEMO_MODE || import.meta.env.MODE === 'development';

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

    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// let analytics: ReturnType<typeof getAnalytics> | undefined;
// isSupported().then((yes) => {
//   if (yes) {
//     analytics = getAnalytics(app);
//   }
// });

export { app, auth, firestore, storage };
