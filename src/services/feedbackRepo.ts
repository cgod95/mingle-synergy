import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, getDocs, deleteDoc, doc, connectFirestoreEmulator } from "firebase/firestore";

type FeedbackItem = {
  id?: string;
  message: string;
  createdAt: number;
  from?: string | null;
};

function tryInitFirebase() {
  try {
    if (!getApps().length) {
      initializeApp({
        apiKey: "demo",
        authDomain: "demo",
        projectId: "demo"
      });
    }
    const db = getFirestore(getApp());
    // Try to connect to emulator if env set
    if (import.meta?.env?.VITE_FIRESTORE_EMULATOR_HOST) {
      const [host, portStr] = (import.meta.env.VITE_FIRESTORE_EMULATOR_HOST as string).split(":");
      const port = Number(portStr || "8082");
      connectFirestoreEmulator(db, host || "localhost", port);
    }
    return db;
  } catch {
    return null;
  }
}

const LS_KEY = "mingle_feedback";

function lsRead(): FeedbackItem[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function lsWrite(items: FeedbackItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export const feedbackRepo = {
  async save(message: string, from?: string | null) {
    const item: FeedbackItem = { message, from: from || null, createdAt: Date.now() };
    const db = tryInitFirebase();
    try {
      if (db) {
        const ref = await addDoc(collection(db, "feedback"), item);
        return { ...item, id: ref.id };
      }
      // fallback to localStorage
      const all = lsRead();
      const id = crypto.randomUUID();
      all.push({ ...item, id });
      lsWrite(all);
      return { ...item, id };
    } catch {
      // final fallback to localStorage if firestore write fails
      const all = lsRead();
      const id = crypto.randomUUID();
      all.push({ ...item, id });
      lsWrite(all);
      return { ...item, id };
    }
  },

  async list(): Promise<FeedbackItem[]> {
    const db = tryInitFirebase();
    try {
      if (db) {
        const snap = await getDocs(collection(db, "feedback"));
        return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<FeedbackItem, "id">) }))
          .sort((a,b) => b.createdAt - a.createdAt);
      }
      const all = lsRead();
      return all.sort((a,b) => b.createdAt - a.createdAt);
    } catch {
      const all = lsRead();
      return all.sort((a,b) => b.createdAt - a.createdAt);
    }
  },

  async remove(id: string) {
    const db = tryInitFirebase();
    try {
      if (db) {
        await deleteDoc(doc(db, "feedback", id));
        return;
      }
      const all = lsRead().filter(i => i.id !== id);
      lsWrite(all);
    } catch {
      const all = lsRead().filter(i => i.id !== id);
      lsWrite(all);
    }
  }
};
