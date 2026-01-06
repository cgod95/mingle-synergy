/**
 * Reconnect Notification Service
 * 
 * Detects when two previously matched users are at the same venue again
 * and triggers a notification to inform them.
 */

import { firestore } from '@/firebase';
import { collection, query, where, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { logError } from '@/utils/errorHandler';

export interface ReconnectOpportunity {
  matchId: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto?: string;
  venueId: string;
  venueName?: string;
}

type NotificationCallback = (opportunities: ReconnectOpportunity[]) => void;

class ReconnectNotificationService {
  private unsubscribe: Unsubscribe | null = null;
  private callbacks: NotificationCallback[] = [];
  private lastOpportunities: ReconnectOpportunity[] = [];

  /**
   * Start watching for reconnect opportunities
   * @param userId Current user's ID
   * @param currentVenueId Current venue the user is checked into
   */
  startWatching(userId: string, currentVenueId: string | null): void {
    // Clean up any existing subscription
    this.stopWatching();

    if (!currentVenueId || !firestore) {
      return;
    }

    try {
      // Query matches where the current user is a participant
      const matchesRef = collection(firestore, 'matches');
      const q1 = query(matchesRef, where('userId1', '==', userId), where('isActive', '==', true));
      const q2 = query(matchesRef, where('userId2', '==', userId), where('isActive', '==', true));

      // We'll need to run both queries and combine results
      this.checkReconnectOpportunities(userId, currentVenueId);

      // Set up periodic check (every 30 seconds)
      const intervalId = setInterval(() => {
        this.checkReconnectOpportunities(userId, currentVenueId);
      }, 30000);

      this.unsubscribe = () => {
        clearInterval(intervalId);
      };
    } catch (error) {
      logError(error as Error, { source: 'reconnectNotificationService', action: 'startWatching', userId });
    }
  }

  /**
   * Stop watching for reconnect opportunities
   */
  stopWatching(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.lastOpportunities = [];
  }

  /**
   * Register a callback to be notified of reconnect opportunities
   */
  onReconnectOpportunity(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);
    
    // Immediately call with current opportunities if any
    if (this.lastOpportunities.length > 0) {
      callback(this.lastOpportunities);
    }

    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Check for reconnect opportunities
   */
  private async checkReconnectOpportunities(userId: string, currentVenueId: string): Promise<void> {
    if (!firestore) return;

    try {
      // Get all active matches for the user
      const matchesRef = collection(firestore, 'matches');
      const q1 = query(matchesRef, where('userId1', '==', userId), where('isActive', '==', true));
      const q2 = query(matchesRef, where('userId2', '==', userId), where('isActive', '==', true));

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const matches: Array<{ id: string; partnerId: string }> = [];
      
      snap1.forEach(doc => {
        const data = doc.data();
        matches.push({ id: doc.id, partnerId: data.userId2 });
      });
      
      snap2.forEach(doc => {
        const data = doc.data();
        matches.push({ id: doc.id, partnerId: data.userId1 });
      });

      if (matches.length === 0) {
        this.lastOpportunities = [];
        return;
      }

      // Get partner IDs
      const partnerIds = matches.map(m => m.partnerId);

      // Query users at the same venue
      const usersRef = collection(firestore, 'users');
      const usersQuery = query(
        usersRef,
        where('currentVenue', '==', currentVenueId),
        where('isCheckedIn', '==', true)
      );

      const usersSnap = await getDocs(usersQuery);
      const usersAtVenue = new Map<string, { name: string; photo?: string }>();
      
      usersSnap.forEach(doc => {
        const data = doc.data();
        usersAtVenue.set(doc.id, {
          name: data.name || data.displayName || 'User',
          photo: data.photos?.[0]
        });
      });

      // Find partners who are at the same venue
      const opportunities: ReconnectOpportunity[] = [];
      
      for (const match of matches) {
        if (usersAtVenue.has(match.partnerId)) {
          const partner = usersAtVenue.get(match.partnerId)!;
          opportunities.push({
            matchId: match.id,
            partnerId: match.partnerId,
            partnerName: partner.name,
            partnerPhoto: partner.photo,
            venueId: currentVenueId
          });
        }
      }

      // Only notify if there are new opportunities
      const newOpportunityIds = opportunities.map(o => o.partnerId).sort().join(',');
      const lastOpportunityIds = this.lastOpportunities.map(o => o.partnerId).sort().join(',');
      
      if (newOpportunityIds !== lastOpportunityIds) {
        this.lastOpportunities = opportunities;
        
        // Notify all callbacks
        for (const callback of this.callbacks) {
          try {
            callback(opportunities);
          } catch (error) {
            logError(error as Error, { source: 'reconnectNotificationService', action: 'callback' });
          }
        }
      }
    } catch (error) {
      logError(error as Error, { source: 'reconnectNotificationService', action: 'checkReconnectOpportunities' });
    }
  }

  /**
   * Get current reconnect opportunities
   */
  getCurrentOpportunities(): ReconnectOpportunity[] {
    return this.lastOpportunities;
  }
}

export const reconnectNotificationService = new ReconnectNotificationService();
export default reconnectNotificationService;









