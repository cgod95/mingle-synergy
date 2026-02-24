import { useEffect, useState, useCallback, useRef } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  where,
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

export function useRealtimeMatches(): RealtimeMatchesResult {
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

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as FirestoreMatch;
        const ts = toEpochMs(data.timestamp);

        // If timestamp is 0 (not yet resolved), treat as just-created
        const effectiveTs = ts || Date.now();
        const matchAge = Date.now() - effectiveTs;

        if (matchAge > MATCH_EXPIRY_MS) {
          continue;
        }

        results.push({ ...data, id: docSnap.id, timestamp: effectiveTs });
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