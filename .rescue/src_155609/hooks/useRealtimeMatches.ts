import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { FirestoreMatch } from "@/types/match";

const MATCH_EXPIRATION_HOURS = 3;

export function useRealtimeMatches(): FirestoreMatch[] {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<FirestoreMatch[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const matchRef = collection(db, "matches");
    const q = query(
      matchRef,
      where("userId1", "==", currentUser.uid)
    );

    const unsubscribe1 = onSnapshot(q, async (snapshot) => {
      const results: FirestoreMatch[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as FirestoreMatch;
        const matchAge = Date.now() - data.timestamp;
        const isExpired = matchAge > MATCH_EXPIRATION_HOURS * 60 * 60 * 1000;

        if (isExpired) {
          await deleteDoc(doc(db, "matches", docSnap.id));
        } else {
          results.push({ ...data, id: docSnap.id });
        }
      }

      setMatches(results);
    });

    const q2 = query(
      matchRef,
      where("userId2", "==", currentUser.uid)
    );

    const unsubscribe2 = onSnapshot(q2, async (snapshot) => {
      const results: FirestoreMatch[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as FirestoreMatch;
        const matchAge = Date.now() - data.timestamp;
        const isExpired = matchAge > MATCH_EXPIRATION_HOURS * 60 * 60 * 1000;

        if (isExpired) {
          await deleteDoc(doc(db, "matches", docSnap.id));
        } else {
          results.push({ ...data, id: docSnap.id });
        }
      }

      setMatches((prev) => [
        ...prev.filter((m) => !results.find((r) => r.id === m.id)),
        ...results,
      ]);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [currentUser?.uid]);

  return matches;
} 