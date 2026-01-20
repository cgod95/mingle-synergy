/**
 * Hook for reconnect notifications
 * 
 * Notifies users when a previous match is at the same venue
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCheckedVenueId } from '@/lib/checkinStore';
import reconnectNotificationService, { ReconnectOpportunity } from '@/services/reconnectNotificationService';
import { useToast } from '@/hooks/use-toast';
import config from '@/config';

export function useReconnectNotification() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<ReconnectOpportunity[]>([]);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser?.uid || config.DEMO_MODE) {
      return;
    }

    const venueId = getCheckedVenueId();
    
    // Start watching for reconnect opportunities
    reconnectNotificationService.startWatching(currentUser.uid, venueId);

    // Subscribe to updates
    const unsubscribe = reconnectNotificationService.onReconnectOpportunity((newOpportunities) => {
      setOpportunities(newOpportunities);

      // Show toast for new opportunities we haven't shown before
      for (const opp of newOpportunities) {
        if (!shownNotifications.has(opp.partnerId)) {
          toast({
            title: "🎉 Someone you matched with is here!",
            description: `${opp.partnerName} is at the same venue. Say hi!`,
            duration: 10000,
          });
          
          setShownNotifications(prev => new Set([...prev, opp.partnerId]));
        }
      }
    });

    return () => {
      unsubscribe();
      reconnectNotificationService.stopWatching();
    };
  }, [currentUser?.uid, toast]);

  // Reset shown notifications when venue changes
  useEffect(() => {
    const venueId = getCheckedVenueId();
    if (!venueId) {
      setShownNotifications(new Set());
      setOpportunities([]);
    }
  }, [getCheckedVenueId()]);

  return {
    opportunities,
    hasOpportunities: opportunities.length > 0
  };
}

export default useReconnectNotification;










