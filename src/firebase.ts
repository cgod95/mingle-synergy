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
    const missingEnvVars = missing.map(key => {
      const envVarName = `VITE_FIREBASE_${key.toUpperCase().replace('SENDERID', 'SENDER_ID')}`;
      return envVarName;
    });
    
    const errorMsg = `
🚨 Firebase Configuration Error 🚨

Missing required environment variables: ${missingEnvVars.join(', ')}

To fix this:
1. Copy .env.example to .env.local
2. Fill in your Firebase project values
3. Or copy .env.development to .env.local for team defaults

Current config: ${JSON.stringify(firebaseConfig, null, 2)}
`;
    
    console.error(errorMsg);
    throw new Error(`Firebase configuration incomplete. Missing: ${missing.join(', ')}`);
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
  const emulatorHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST;
  
  // Handle both port-only (8080) and full URL (localhost:8080) formats
  let host = 'localhost';
  let port = 8080;
  
  if (emulatorHost.includes(':')) {
    // Format: "localhost:8080" or "http://localhost:8080"
    const parts = emulatorHost.replace(/^https?:\/\//, '').split(':');
    host = parts[0];
    port = parseInt(parts[1], 10);
  } else {
    // Format: "8080" (port only)
    port = parseInt(emulatorHost, 10);
  }
  
  if (isNaN(port)) {
    console.error('Invalid Firestore emulator port:', emulatorHost);
  } else {
    connectFirestoreEmulator(db, host, port);
  }
}