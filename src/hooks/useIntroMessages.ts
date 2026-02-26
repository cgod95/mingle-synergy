import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseAvailable } from '@/firebase/safeFirebase';

interface IntroMessage {
  fromUserId: string;
  message: string;
  timestamp: number;
  venueId: string;
}

/**
 * Subscribes to intro messages sent TO the current user.
 * Returns a Map of senderId -> IntroMessage for quick lookup.
 */
export function useIntroMessages(): Map<string, IntroMessage> {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Map<string, IntroMessage>>(new Map());

  useEffect(() => {
    if (!currentUser?.uid || !isFirebaseAvailable() || !firestore) return;

    const q = query(
      collection(firestore, 'introMessages'),
      where('toUserId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const map = new Map<string, IntroMessage>();
      snap.forEach((doc) => {
        const data = doc.data();
        map.set(data.fromUserId, {
          fromUserId: data.fromUserId,
          message: data.message,
          timestamp: data.timestamp,
          venueId: data.venueId,
        });
      });
      setMessages(map);
    }, () => {
      // Silently handle errors — non-critical feature
    });

    return unsub;
  }, [currentUser?.uid]);

  return messages;
}
