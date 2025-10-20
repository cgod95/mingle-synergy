import { db } from "../firebase/init";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  photoURL?: string;
}

const USERS = "users";

export async function getUserProfile(userId: string) {
  const ref = doc(db, USERS, userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(user: User, data: Partial<UserProfile>) {
  const ref = doc(db, USERS, user.uid);
  const profile = { id: user.uid, ...data };
  await setDoc(ref, profile);
  return profile;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  const ref = doc(db, USERS, userId);
  await updateDoc(ref, data);
}
