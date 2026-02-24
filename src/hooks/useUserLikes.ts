import { useEffect, useState, useRef } from "react";
import { db } from "@/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

/**
 * Real-time listener for the current user's likes from Firestore.
 * Returns a Set of user IDs that the current user has liked.
 */
export function useUserLikes(): Set<string> {
  const { currentUser } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!currentUser?.uid || !db) {
      setLikedIds(new Set());
      return;
    }

    const likesDocRef = doc(db, "likes", currentUser.uid);

    const unsubscribe = onSnapshot(
      likesDocRef,
      (snapshot) => {
        if (!mountedRef.current) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          const likes: string[] = data?.likes || [];
          setLikedIds(new Set(likes));
        } else {
          setLikedIds(new Set());
        }
      },
      () => {
        if (mountedRef.current) setLikedIds(new Set());
      }
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [currentUser?.uid]);

  return likedIds;
}
