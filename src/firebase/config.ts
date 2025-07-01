import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBKTX6N5AIeVvQhQIz_kAwNe6o3RYXl5vA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mingle-a12a2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mingle-a12a2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mingle-a12a2.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "412919211446",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:412919211446:web:7e68a7d9bf4ed1af860d17",
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FSCE44K0P6",
};

console.log("[firebase] config loaded:", firebaseConfig);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// let analytics: ReturnType<typeof getAnalytics> | undefined;
// isSupported().then((yes) => {
//   if (yes) {
//     analytics = getAnalytics(app);
//   }
// });

export { app, auth, firestore, storage };
