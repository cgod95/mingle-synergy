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
export function usePeopleAtVenue(venueId: string | undefined): VenueUser[] {
  const [people, setPeople] = useState<VenueUser[]>([]);

  useEffect(() => {
    if (!venueId || !firestore) {
      setPeople([]);
      return;
    }

    const usersRef = collection(firestore, "users");
    const q = query(
      usersRef,
      where("currentVenue", "==", venueId),
      where("isVisible", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const users: VenueUser[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as VenueUser[];
        setPeople(users);
      },
      (error) => {
        logError(error, { source: "usePeopleAtVenue", venueId });
        setPeople([]);
      }
    );

    return () => unsubscribe();
  }, [venueId]);

  return people;
}
