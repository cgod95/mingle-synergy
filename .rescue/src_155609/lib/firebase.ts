import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// If you already have these envs, keep them; otherwise this uses your known config.
const firebaseConfig = {
  apiKey: "AIzaSyBKTX6N5AIeVvQhQIz_kAwNe6o3RYXl5vA",
  authDomain: "mingle-a12a2.firebaseapp.com",
  projectId: "mingle-a12a2",
  storageBucket: "mingle-a12a2.appspot.com",
  messagingSenderId: "412919211446",
  appId: "1:412919211446:web:7e68a7d9bf4ed1af860d17",
  measurementId: "G-FSCE44K0P6"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const storage = getStorage(app);
export default app;
