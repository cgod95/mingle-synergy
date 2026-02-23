import { useEffect, useState, useCallback, useRef } from "react";
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

interface RealtimeMatchesResult {
  matches: FirestoreMatch[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * Fire-and-forget cleanup of expired matches.
 * Runs outside the snapshot callback to avoid triggering cascading
 * onSnapshot events that can cause React re-render loops (error #310).
 */
function cleanupExpiredMatches(expiredIds: Array<{ id: string; userId1: string; userId2: string }>) {
  if (!db || expiredIds.length === 0) return;
  for (const expired of expiredIds) {
    deleteDoc(doc(db, "matches", expired.id))
      .then(async () => {
        try {
          const { trackMatchExpired } = await import("@/services/specAnalytics");
          trackMatchExpired(expired.id, expired.userId1, expired.userId2);
        } catch { /* best-effort analytics */ }
      })
      .catch(() => { /* best-effort cleanup */ });
  }
}

export function useRealtimeMatches(): RealtimeMatchesResult {
  // #region agent log
  console.error('[DBG310] useRealtimeMatches', {hasDb:!!db});
  // #endregion
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<FirestoreMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const mountedRef = useRef(true);

  const retry = useCallback(() => {
    setError(null);
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (!currentUser?.uid) {
      setMatches([]);
      setLoading(false);
      return;
    }

    if (!db) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const matchRef = collection(db, "matches");
    let matches1: FirestoreMatch[] = [];
    let matches2: FirestoreMatch[] = [];
    let got1 = false;
    let got2 = false;

    function merge() {
      if (!mountedRef.current) return;
      const combined = [...matches1];
      for (const m of matches2) {
        if (!combined.find((c) => c.id === m.id)) combined.push(m);
      }
      setMatches(combined);
      if (got1 && got2) setLoading(false);
    }

    function toEpochMs(val: unknown): number {
      if (typeof val === 'number') return val;
      if (val && typeof (val as any).toMillis === 'function') return (val as any).toMillis();
      if (val && typeof (val as any).toDate === 'function') return (val as any).toDate().getTime();
      return 0;
    }

    function processSnapshot(snapshot: import("firebase/firestore").QuerySnapshot): FirestoreMatch[] {
      const results: FirestoreMatch[] = [];
      const expired: Array<{ id: string; userId1: string; userId2: string }> = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as FirestoreMatch;
        const ts = toEpochMs(data.timestamp);
        const matchAge = Date.now() - ts;
        if (matchAge > MATCH_EXPIRY_MS) {
          expired.push({ id: docSnap.id, userId1: data.userId1, userId2: data.userId2 });
        } else {
          results.push({ ...data, id: docSnap.id, timestamp: ts });
        }
      }

      // Schedule cleanup outside the synchronous snapshot handler
      if (expired.length > 0) {
        setTimeout(() => cleanupExpiredMatches(expired), 0);
      }

      return results;
    }

    const q1 = query(matchRef, where("userId1", "==", currentUser.uid));
    const q2 = query(matchRef, where("userId2", "==", currentUser.uid));

    const unsubscribe1 = onSnapshot(
      q1,
      (snapshot) => {
        matches1 = processSnapshot(snapshot);
        got1 = true;
        if (mountedRef.current) setError(null);
        merge();
      },
      (err) => {
        console.warn("useRealtimeMatches q1 error:", err);
        got1 = true;
        if (mountedRef.current) setError(err);
        merge();
      }
    );

    const unsubscribe2 = onSnapshot(
      q2,
      (snapshot) => {
        matches2 = processSnapshot(snapshot);
        got2 = true;
        if (mountedRef.current) setError(null);
        merge();
      },
      (err) => {
        console.warn("useRealtimeMatches q2 error:", err);
        got2 = true;
        if (mountedRef.current) setError(err);
        merge();
      }
    );

    return () => {
      mountedRef.current = false;
      unsubscribe1();
      unsubscribe2();
    };
  }, [currentUser?.uid, retryKey]);

  return { matches, loading, error, retry };
} 