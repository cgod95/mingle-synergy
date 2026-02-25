import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { useRealtimeMatches } from '@/hooks/useRealtimeMatches';
import { toast } from '@/hooks/use-toast';
import { logError } from '@/utils/errorHandler';

/**
 * Subscribes to all active matches' latest messages and shows
 * an in-app toast when a new message arrives while the user
 * is NOT on that particular ChatRoom.
 */
export function useMessageNotifications() {
  const { currentUser } = useAuth();
  const { matches } = useRealtimeMatches();
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  const latestTsRef = useRef<Map<string, number>>(new Map());
  const initialLoadRef = useRef<Set<string>>(new Set());
  const nameCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!currentUser?.uid || !firestore || matches.length === 0) return;

    const unsubs: (() => void)[] = [];

    for (const match of matches) {
      const matchId = match.id;
      const partnerId = match.userId1 === currentUser.uid ? match.userId2 : match.userId1;

      const q = query(
        collection(firestore, 'messages'),
        where('matchId', '==', matchId),
        orderBy('createdAt', 'desc'),
        limit(1),
      );

      const unsub = onSnapshot(
        q,
        async (snap) => {
          if (snap.empty) return;
          const d = snap.docs[0];
          const data = d.data();
          const ts = data.createdAt?.toDate?.()?.getTime?.() || 0;
          const senderId = data.senderId;
          const text = data.text || '';

          if (!initialLoadRef.current.has(matchId)) {
            initialLoadRef.current.add(matchId);
            latestTsRef.current.set(matchId, ts);
            return;
          }

          const prev = latestTsRef.current.get(matchId) || 0;
          if (ts <= prev) return;
          latestTsRef.current.set(matchId, ts);

          if (senderId === currentUser.uid) return;

          const currentPath = locationRef.current;
          const currentChatId = currentPath.startsWith('/chat/')
            ? currentPath.split('/chat/')[1]
            : null;
          if (currentChatId === matchId) return;

          let senderName = nameCache.current.get(partnerId);
          if (!senderName) {
            try {
              const userDoc = await getDoc(doc(firestore!, 'users', partnerId));
              senderName = userDoc.data()?.displayName || userDoc.data()?.name || 'Someone';
              nameCache.current.set(partnerId, senderName!);
            } catch {
              senderName = 'Someone';
            }
          }

          const preview = text.length > 60 ? text.slice(0, 57) + '...' : text;

          toast({
            title: senderName,
            description: preview,
          });
        },
        (err) => {
          logError(err instanceof Error ? err : new Error('Message notification listener failed'), {
            context: 'useMessageNotifications',
            matchId,
          });
        },
      );

      unsubs.push(unsub);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [currentUser?.uid, matches.length]);
}
