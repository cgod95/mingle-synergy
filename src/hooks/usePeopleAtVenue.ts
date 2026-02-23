import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { logError } from "@/utils/errorHandler";

interface VenueUser {
  id: string;
  displayName?: string;
  name?: string;
  photos?: string[];
  photo?: string;
  age?: number;
  bio?: string;
  isVisible?: boolean;
}

/**
 * Real-time hook that returns users currently checked in at a venue.
 * Uses Firestore onSnapshot so the list updates live as people check in/out.
 */
export function usePeopleAtVenue(venueId: string | undefined): { people: VenueUser[]; loading: boolean; error: Error | null; retry: () => void } {
  const [people, setPeople] = useState<VenueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const retry = () => {
    setError(null);
    setRetryKey(k => k + 1);
  };

  useEffect(() => {
    if (!venueId || !firestore) {
      setPeople([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const usersRef = collection(firestore, "users");
    const q = query(
      usersRef,
      where("currentVenue", "==", venueId),
      where("isVisible", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users: VenueUser[] = snapshot.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            displayName: raw.displayName ?? raw.name,
            name: raw.name,
            photos: Array.isArray(raw.photos) ? raw.photos : undefined,
            photo: typeof raw.photo === 'string' ? raw.photo : undefined,
            age: typeof raw.age === 'number' ? raw.age : undefined,
            bio: typeof raw.bio === 'string' ? raw.bio : undefined,
            isVisible: raw.isVisible,
          };
        });
        setPeople(users);
        setError(null);
        setLoading(false);
      },
      (err) => {
        logError(err, { source: "usePeopleAtVenue", venueId });
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [venueId, retryKey]);

  return { people, loading, error, retry };
}
