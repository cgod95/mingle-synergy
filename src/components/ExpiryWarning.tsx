import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  getCheckedVenueId,
  getRemainingCheckInTime,
  isCheckInExpiringSoon,
  isCheckInExpired,
  clearCheckIn,
  CHECKIN_WARNING_MS,
} from '@/lib/checkinStore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ExpiryWarningProps {
  className?: string;
}

export function ExpiryWarning({ className = '' }: ExpiryWarningProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [remainingMs, setRemainingMs] = useState(getRemainingCheckInTime());
  const [dismissed, setDismissed] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  useEffect(() => {
    // Update remaining time every 10 seconds
    const interval = setInterval(() => {
      const remaining = getRemainingCheckInTime();
      setRemainingMs(remaining);

      // Auto-clear expired check-ins
      if (remaining <= 0 && getCheckedVenueId()) {
        handleExpired();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Show toast warning when approaching expiry
  useEffect(() => {
    if (isCheckInExpiringSoon() && !hasShownWarning && !dismissed) {
      setHasShownWarning(true);
      toast({
        title: "Check-in expiring soon",
        description: `Your check-in will expire in ${formatTime(remainingMs)}. Visit a venue to re-check-in.`,
        duration: 10000,
      });
    }
  }, [remainingMs, hasShownWarning, dismissed, toast]);

  const handleExpired = async () => {
    const venueId = getCheckedVenueId();
    
    clearCheckIn(currentUser?.uid);

    toast({
      title: "Check-in expired",
      description: "Your check-in has expired. Visit a venue to check in again.",
      duration: 5000,
    });
  };

  const handleReCheckIn = () => {
    navigate('/checkin');
  };

  const formatTime = (ms: number): string => {
    if (ms <= 0) return 'Expired';
    
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Don't show if not checked in or dismissed
  if (!getCheckedVenueId() || dismissed) {
    return null;
  }

  // Don't show if more than 30 minutes remaining
  if (!isCheckInExpiringSoon() && !isCheckInExpired()) {
    return null;
  }

  const isExpired = isCheckInExpired();

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 max-w-md mx-auto ${className}`}
    >
      <div
        className={`rounded-xl p-4 shadow-lg border-2 backdrop-blur-sm ${
          isExpired
            ? 'bg-red-900/80 border-red-500 text-white'
            : 'bg-amber-900/80 border-amber-500 text-white'
        }`}
      >
        <div className="flex items-start gap-3">
          {isExpired ? (
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">
              {isExpired ? 'Check-in Expired' : 'Check-in Expiring Soon'}
            </h4>
            <p className="text-xs opacity-90 mb-3">
              {isExpired
                ? 'Your check-in has expired. Check in again to continue meeting people.'
                : `Your check-in expires in ${formatTime(remainingMs)}. Visit a venue to re-check-in.`}
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReCheckIn}
                className={`text-xs h-8 ${
                  isExpired
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                {isExpired ? 'Check In Again' : 'Extend Check-in'}
              </Button>
              
              {!isExpired && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDismissed(true)}
                  className="text-xs h-8 text-white/80 hover:text-white hover:bg-white/10"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpiryWarning;

