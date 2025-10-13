import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Match } from "@/types/match";
import logger from '@/utils/Logger';

export const useRealtimeMatches = () => {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) return;

    // Use mock uid for development
    const mockUid = "mock-user-id";

    setLoading(true);

    // Query for matches where the current user is a participant
    const matchesQuery = query(
      collection(db, "matches"),
      where("participantIds", "array-contains", mockUid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      matchesQuery,
      (snapshot) => {
        const matchesData: Match[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          matchesData.push({
            id: doc.id,
            ...data,
          } as Match);
        });
        setMatches(matchesData);
        setLoading(false);
      },
      (error) => {
        logger.error("Error listening to matches:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return { matches, loading };
}; 