import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/firebase/config';

export interface UnreadCounts {
  [matchId: string]: number;
}

export const subscribeToUnreadCounts = (
  userId: string, 
  callback: (counts: UnreadCounts) => void
) => {
  if (!userId || !firestore) return () => {};

  const matchesRef = collection(firestore, 'matches');
  const q1 = query(matchesRef, where("userId1", "==", userId));
  const q2 = query(matchesRef, where("userId2", "==", userId));

  let ids1 = new Set<string>();
  let ids2 = new Set<string>();
  let messagesUnsubscribes: (() => void)[] = [];
  let subscribedBatches: string[][] = [];
  let latestCounts: UnreadCounts = {};
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const getAllMatchIds = () => new Set([...ids1, ...ids2]);

  const debouncedCallback = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => callback({ ...latestCounts }), 500);
  };

  const rebuildMessageListeners = () => {
    messagesUnsubscribes.forEach(unsub => unsub());
    messagesUnsubscribes = [];
    subscribedBatches = [];
    latestCounts = {};

    const allIds = Array.from(getAllMatchIds());
    if (allIds.length === 0) {
      debouncedCallback();
      return;
    }

    allIds.forEach(id => { latestCounts[id] = 0; });

    for (let i = 0; i < allIds.length; i += 10) {
      const batch = allIds.slice(i, i + 10);
      subscribedBatches.push(batch);
      const batchIndex = subscribedBatches.length - 1;

      const messagesQuery = query(
        collection(firestore!, 'messages'),
        where('matchId', 'in', batch)
      );

      const unsub = onSnapshot(messagesQuery, (snapshot) => {
        subscribedBatches[batchIndex].forEach(id => { latestCounts[id] = 0; });

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const readBy: string[] = data.readBy || [];
          if (!readBy.includes(userId)) {
            const matchId = data.matchId;
            if (matchId && latestCounts[matchId] !== undefined) {
              latestCounts[matchId]++;
            }
          }
        });

        debouncedCallback();
      }, (error) => {
        console.error('Error in messages subscription:', error);
      });

      messagesUnsubscribes.push(unsub);
    }
  };

  const unsubscribe1 = onSnapshot(q1, (snapshot) => {
    ids1 = new Set(snapshot.docs.map(doc => doc.id));
    rebuildMessageListeners();
  }, (error) => {
    console.warn('Error in matches subscription (q1):', error);
  });

  const unsubscribe2 = onSnapshot(q2, (snapshot) => {
    ids2 = new Set(snapshot.docs.map(doc => doc.id));
    rebuildMessageListeners();
  }, (error) => {
    console.warn('Error in matches subscription (q2):', error);
  });

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribe1();
    unsubscribe2();
    messagesUnsubscribes.forEach(unsub => unsub());
  };
};

export const getTotalUnreadCount = (counts: UnreadCounts): number => {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
};
