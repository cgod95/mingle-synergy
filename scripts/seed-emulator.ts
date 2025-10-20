import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { getAuth, connectAuthEmulator, signInAnonymously } from "firebase/auth";

const app = initializeApp({
  apiKey: "fake-local-key",
  authDomain: "localhost",
  projectId: "mingle-a12a2",
  appId: "fake-local-app-id",
});
const auth = getAuth(app);
connectAuthEmulator(auth, "http://localhost:9099");
const db = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8082);

async function main() {
  // sign in anon so security rules don’t block any uid-scoped writes later
  await signInAnonymously(auth);

  // seed venues
  const venues = [
    { id: "bar-aurora", name: "Aurora Bar", city: "London", tags: ["cocktails","date-night"], active: true },
    { id: "club-orbit", name: "Orbit Club", city: "London", tags: ["dance","late-night"], active: true },
    { id: "pub-anchor", name: "The Anchor", city: "London", tags: ["casual","pints"], active: true }
  ];
  for (const v of venues) {
    await setDoc(doc(collection(db, "venues"), v.id), v);
  }

  // seed a minimal user profile record (linked later after auth)
  await setDoc(doc(collection(db, "users"), "demo-seeded-user"), {
    displayName: "Demo User",
    createdAt: Date.now(),
    onboardingComplete: false,
  });

  console.log("✅ Seed complete");
}
main().catch(e => { console.error(e); process.exit(1); });
