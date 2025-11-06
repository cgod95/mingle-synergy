import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Read env with safe fallbacks
const USE_EMU = String(import.meta.env.VITE_USE_FIREBASE_EMULATOR) === "true";
const AUTH_HOST = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_HOST || "localhost";
const AUTH_PORT = Number(import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_PORT || 9099);
const FS_HOST = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || "localhost";
const FS_PORT = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8082);

// Your web config (prod values OK here; emulator ignores them locally)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "fake-local-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mingle-a12a2",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "fake-local-app-id",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Guard so we only connect once per page load
const g = globalThis as any;
if (USE_EMU && !g.__MINGLE_EMULATORS_CONNECTED__) {
  try {
    connectAuthEmulator(auth, `http://${AUTH_HOST}:${AUTH_PORT}`, { disableWarnings: true });
  } catch {}
  try {
    connectFirestoreEmulator(db, FS_HOST, FS_PORT);
  } catch {}
  g.__MINGLE_EMULATORS_CONNECTED__ = true;
}

export { app, auth, db };
