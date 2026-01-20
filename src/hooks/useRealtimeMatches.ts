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
import { MATCH_EXPIRY_MS } from "@/lib/matchesCompat";
import config from "@/config";

const MATCH_EXPIRATION_HOURS = 3; // Keep for compatibility, but use MATCH_EXPIRY_MS for calculations

export function useRealtimeMatches(): FirestoreMatch[] {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<FirestoreMatch[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // CRITICAL: Guard against null Firebase in demo mode
    if (!db) {
      // In demo mode, Firebase is null - return empty array
      setMatches([]);
      return;
    }

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
        const isExpired = matchAge > MATCH_EXPIRY_MS;

            if (isExpired) {
              await deleteDoc(doc(db, "matches", docSnap.id));
              
              // Track match expired event per spec section 9
              try {
                const { trackMatchExpired } = await import("@/services/specAnalytics");
                trackMatchExpired(docSnap.id, data.userId1, data.userId2);
              } catch (error) {
                console.warn('Failed to track match_expired event:', error);
              }
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
        const isExpired = matchAge > MATCH_EXPIRY_MS;

            if (isExpired) {
              await deleteDoc(doc(db, "matches", docSnap.id));
              
              // Track match expired event per spec section 9
              try {
                const { trackMatchExpired } = await import("@/services/specAnalytics");
                trackMatchExpired(docSnap.id, data.userId1, data.userId2);
              } catch (error) {
                console.warn('Failed to track match_expired event:', error);
              }
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