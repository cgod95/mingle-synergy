import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/config";

export type UserProfile = {
  displayName: string;
  age: number | null;
  updatedAt: number;
};

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function saveCurrentUserProfile(p: Partial<UserProfile>) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");
  const ref = doc(db, "users", uid);
  const now = Date.now();
  await setDoc(
    ref,
    {
      displayName: p.displayName ?? "",
      age: p.age ?? null,
      updatedAt: now,
    },
    { merge: true }
  );
}
