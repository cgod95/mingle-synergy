import { addDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db as firestoreDb } from "@/firebase/config";

type FeedbackItem = {
  id?: string;
  message: string;
  createdAt: number;
  from?: string | null;
};

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
    try {
      if (firestoreDb) {
        const ref = await addDoc(collection(firestoreDb, "feedback"), item);
        return { ...item, id: ref.id };
      }
      const all = lsRead();
      const id = crypto.randomUUID();
      all.push({ ...item, id });
      lsWrite(all);
      return { ...item, id };
    } catch {
      const all = lsRead();
      const id = crypto.randomUUID();
      all.push({ ...item, id });
      lsWrite(all);
      return { ...item, id };
    }
  },

  async list(): Promise<FeedbackItem[]> {
    try {
      if (firestoreDb) {
        const snap = await getDocs(collection(firestoreDb, "feedback"));
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
    try {
      if (firestoreDb) {
        await deleteDoc(doc(firestoreDb, "feedback", id));
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
