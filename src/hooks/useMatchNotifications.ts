import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import config from '@/config';
import { logError } from '@/utils/errorHandler';

/**
 * Hook to listen for new match notifications and show toast
 * When a match is created, the other user gets a notification document
 * This hook watches that document and shows a toast when a new match arrives
 * After displaying, notifications are removed from Firebase to prevent re-showing
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
      async (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const newMatches = data.newMatches || [];
        const processedInThisBatch: Array<{ matchId: string; userId: string; timestamp: number; type?: string }> = [];

        // Process each new match
        newMatches.forEach((match: { matchId: string; userId: string; timestamp: number; type?: string }) => {
          // Skip if we've already processed this match in this session
          if (processedMatchesRef.current.has(match.matchId)) return;
          
          // Mark as processed locally
          processedMatchesRef.current.add(match.matchId);
          processedInThisBatch.push(match);

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

        // Clear processed notifications from Firebase to prevent re-showing on refresh
        if (processedInThisBatch.length > 0) {
          try {
            // Remove each processed notification from the array
            for (const match of processedInThisBatch) {
              await updateDoc(notificationRef, {
                newMatches: arrayRemove(match)
              });
            }
          } catch (cleanupError) {
            // Non-critical - notifications will just show again on refresh
            logError(cleanupError instanceof Error ? cleanupError : new Error('Failed to clear notifications'), {
              context: 'useMatchNotifications.cleanup',
              userId: currentUser?.uid
            });
          }
        }
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

