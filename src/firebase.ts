import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import config from "@/config";

const firebaseConfig = config.FIREBASE_CONFIG;

// Validate required Firebase config at runtime for clearer errors
const validateFirebaseConfig = (): void => {
  const requiredKeys = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ] as const;

  const missing = requiredKeys.filter((key) => !firebaseConfig?.[key]);
  if (missing.length > 0) {
    console.error(
      "Firebase configuration is missing required keys:",
      missing,
      "\nEnsure your environment variables are set (e.g., VITE_FIREBASE_*) or config.ts is correctly wired."
    );
  }
};
validateFirebaseConfig();

// ✅ Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Environment banner (prints once)
(() => {
  console.info('%c⚡ Mingle Firebase Init', 'color: purple; font-weight:bold;', {
    projectId: firebaseConfig.projectId,
    emulatorAuth: import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST,
    emulatorFirestore: import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST,
  });
})();

// Connect to emulators in development when env vars are provided
if (import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST) {
  connectAuthEmulator(auth, import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST, {
    disableWarnings: true,
  });
}

if (import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST) {
  connectFirestoreEmulator(db, 'localhost', Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST.split(':').pop()));
}