import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import config from '@/config';
import { logError } from '@/utils/errorHandler';

/**
 * Hook to listen for new match notifications and show toast
 * When a match is created, the other user gets a notification document
 * This hook watches that document and shows a toast when a new match arrives
 */
export function useMatchNotifications() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const processedMatchesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (config.DEMO_MODE || !currentUser?.uid || !firestore) return;

    const notificationRef = doc(firestore, 'notifications', currentUser.uid);
    
    const unsubscribe = onSnapshot(
      notificationRef,
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const newMatches = data.newMatches || [];

        // Process each new match
        newMatches.forEach((match: { matchId: string; userId: string; timestamp: number; type?: string }) => {
          // Skip if we've already processed this match
          if (processedMatchesRef.current.has(match.matchId)) return;
          
          // Mark as processed
          processedMatchesRef.current.add(match.matchId);

          // Show toast notification with different messages based on type
          if (match.type === 'matched_back') {
            // First liker - someone they liked matched them back
            toast({
              title: "Someone you liked matched you! 🎉",
              description: "You can now chat with them",
            });
          } else {
            // Match completer or default - it's a match
            toast({
              title: "It's a match! 🎉",
              description: "You can now chat with this person",
            });
          }
        });
      },
      (error) => {
        logError(error instanceof Error ? error : new Error('Failed to subscribe to match notifications'), {
          context: 'useMatchNotifications',
          userId: currentUser?.uid
        });
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, toast]);
}

