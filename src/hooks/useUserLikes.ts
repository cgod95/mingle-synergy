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
          // #region agent log
          console.error('[DBG59ec69] useUserLikes snapshot:', likes.length, 'likes');
          // #endregion
          setLikedIds(new Set(likes));
        } else {
          // #region agent log
          console.error('[DBG59ec69] useUserLikes: no likes doc exists');
          // #endregion
          setLikedIds(new Set());
        }
      },
      (err) => {
        // #region agent log
        console.error('[DBG59ec69] useUserLikes error:', err);
        // #endregion
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
