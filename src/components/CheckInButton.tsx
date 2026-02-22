import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  checkInAt,
  clearCheckIn,
  getCheckedVenueId,
  getRemainingCheckInTime,
} from '@/lib/checkinStore';

interface CheckInButtonProps {
  venueId: string;
  venueName: string;
  onCheckIn?: () => void;
  className?: string;
}

export default function CheckInButton({ venueId, venueName, onCheckIn, className }: CheckInButtonProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isCurrentVenue, setIsCurrentVenue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Sync from checkinStore
  useEffect(() => {
    function sync() {
      const activeVenue = getCheckedVenueId();
      setIsCurrentVenue(activeVenue === venueId);

      if (activeVenue === venueId) {
        const remaining = getRemainingCheckInTime();
        if (remaining > 0) {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(null);
        }
      } else {
        setTimeRemaining(null);
      }
    }

    sync();
    // Re-check every 30s in case expiry approaches
    const interval = setInterval(sync, 30_000);
    // Also listen for the custom checkin event
    window.addEventListener('mingle:checkin', sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mingle:checkin', sync);
    };
  }, [venueId]);

  const handleCheckIn = async () => {
    if (!currentUser?.uid) return;

    // Already checked in here
    if (isCurrentVenue) {
      toast({
        title: "Already checked in",
        description: `You're already checked in to ${venueName}`,
      });
      return;
    }

    setLoading(true);
    try {
      checkInAt(venueId, currentUser.uid);
      setIsCurrentVenue(true);

      toast({
        title: "Successfully checked in! 🎉",
        description: `You're now visible to others at ${venueName}`,
      });

      onCheckIn?.();
    } catch {
      toast({
        title: "Check-in failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser?.uid || !isCurrentVenue) return;

    setLoading(true);
    try {
      clearCheckIn(currentUser.uid);
      setIsCurrentVenue(false);

      toast({
        title: "Checked out",
        description: `You're no longer visible at ${venueName}`,
      });
    } catch {
      toast({
        title: "Check-out failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {isCurrentVenue ? (
        <Card className="border-green-700 bg-green-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-300">
              <CheckCircle className="w-5 h-5 mr-2" />
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-200">{venueName}</span>
              {timeRemaining && (
                <Badge variant="secondary" className="bg-green-800 text-green-200">
                  <Clock className="w-3 h-3 mr-1" />
                  {timeRemaining}
                </Badge>
              )}
            </div>
            <Button
              onClick={handleCheckOut}
              disabled={loading}
              variant="outline"
              className="w-full border-green-600 text-green-300 hover:bg-green-800/50"
            >
              {loading ? "Checking out..." : "Check Out"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-neutral-700 bg-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-neutral-200">
              <MapPin className="w-5 h-5 mr-2" />
              Check In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-neutral-400">{venueName}</div>
            <div className="text-xs text-neutral-500">
              Check in for 12 hours to meet people here.
            </div>
            <Button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Checking in..." : "Check In"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
