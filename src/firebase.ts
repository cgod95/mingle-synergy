// 🧠 Purpose: Firebase core configuration and exports for use across the app.

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import config from "@/config";

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 🛠 Emulator Connections (development only)
if (config.ENVIRONMENT === "development") {
  const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
  const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST;
  const storageHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST;

  if (authHost) {
    connectAuthEmulator(auth, authHost);
  }

  if (firestoreHost) {
    const [host, port] = firestoreHost.split(":");
    if (host && port) {
      connectFirestoreEmulator(db, host, Number(port));
    }
  }

  if (storageHost) {
    const [host, port] = storageHost.split(":");
    if (host && port) {
      connectStorageEmulator(storage, host, Number(port));
    }
  }
}

export { app, auth, db, storage };