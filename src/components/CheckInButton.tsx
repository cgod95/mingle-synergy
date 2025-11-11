import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { mockUsers } from '@/data/mock';

interface CheckInButtonProps {
  venueId: string;
  venueName: string;
  onCheckIn?: () => void;
  className?: string;
}

interface CheckInStatus {
  isCheckedIn: boolean;
  checkInTime: number | null;
  expiresAt: number | null;
  venueName: string;
}

export default function CheckInButton({ venueId, venueName, onCheckIn, className }: CheckInButtonProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(null);
  const [activeCheckIns, setActiveCheckIns] = useState<CheckInStatus[]>([]);
  const [loading, setLoading] = useState(false);

  // Load check-in status from localStorage
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userCheckIns = JSON.parse(localStorage.getItem(`checkIns_${currentUser.uid}`) || '[]');
    const currentVenueCheckIn = userCheckIns.find((ci: CheckInStatus) => 
      ci.venueName === venueName && ci.expiresAt && Date.now() < ci.expiresAt
    );
    
    setCheckInStatus(currentVenueCheckIn || null);
    setActiveCheckIns(userCheckIns.filter((ci: CheckInStatus) => 
      ci.expiresAt && Date.now() < ci.expiresAt
    ));
  }, [currentUser?.uid, venueName]);

  const handleCheckIn = async () => {
    if (!currentUser?.uid) return;

    setLoading(true);

    try {
      // Check if user is already checked in here
      if (checkInStatus?.isCheckedIn) {
        toast({
          title: "Already checked in",
          description: `You're already checked in to ${venueName}`,
        });
        return;
      }

      // Check if user has reached the 3 venue limit
      if (activeCheckIns.length >= 3) {
        toast({
          title: "Check-in limit reached",
          description: "You can only be checked in to 3 venues at a time. Check out of another venue first.",
          variant: "destructive",
        });
        return;
      }

      // Create new check-in (12 hours duration)
      const now = Date.now();
      const expiresAt = now + (12 * 60 * 60 * 1000); // 12 hours
      
      const newCheckIn: CheckInStatus = {
        isCheckedIn: true,
        checkInTime: now,
        expiresAt,
        venueName,
      };

      // Update localStorage
      const userCheckIns = JSON.parse(localStorage.getItem(`checkIns_${currentUser.uid}`) || '[]');
      userCheckIns.push(newCheckIn);
      localStorage.setItem(`checkIns_${currentUser.uid}`, JSON.stringify(userCheckIns));

      // Update state
      setCheckInStatus(newCheckIn);
      setActiveCheckIns(prev => [...prev, newCheckIn]);

      // Update user's current venue in mock data
      const userIndex = mockUsers.findIndex(u => u.id === currentUser.uid);
      if (userIndex !== -1) {
        mockUsers[userIndex].currentVenue = venueId;
        mockUsers[userIndex].isCheckedIn = true;
        mockUsers[userIndex].lastCheckIn = venueName;
        mockUsers[userIndex].lastActive = now;
      }

      toast({
        title: "Successfully checked in! 🎉",
        description: `You're now visible to others at ${venueName}`,
      });

      onCheckIn?.();
    } catch (error) {
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
    if (!currentUser?.uid || !checkInStatus) return;

    setLoading(true);

    try {
      // Remove from localStorage
      const userCheckIns = JSON.parse(localStorage.getItem(`checkIns_${currentUser.uid}`) || '[]');
      const updatedCheckIns = userCheckIns.filter((ci: CheckInStatus) => 
        ci.venueName !== venueName
      );
      localStorage.setItem(`checkIns_${currentUser.uid}`, JSON.stringify(updatedCheckIns));

      // Update state
      setCheckInStatus(null);
      setActiveCheckIns(prev => prev.filter(ci => ci.venueName !== venueName));

      // Update user's current venue in mock data
      const userIndex = mockUsers.findIndex(u => u.id === currentUser.uid);
      if (userIndex !== -1) {
        delete mockUsers[userIndex].currentVenue;
        mockUsers[userIndex].isCheckedIn = false;
      }

      toast({
        title: "Checked out",
        description: `You're no longer visible at ${venueName}`,
      });
    } catch (error) {
      toast({
        title: "Check-out failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!checkInStatus?.expiresAt) return null;
    const remaining = checkInStatus.expiresAt - Date.now();
    if (remaining <= 0) return null;
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className={className}>
      {checkInStatus?.isCheckedIn ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">{venueName}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Clock className="w-3 h-3 mr-1" />
                {timeRemaining}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <Users className="w-4 h-4 mr-1" />
              {mockUsers.filter(u => u.currentVenue === venueId && u.isCheckedIn).length} people here
            </div>
            <Button 
              onClick={handleCheckOut}
              disabled={loading}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-100"
            >
              {loading ? "Checking out..." : "Check Out"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Check In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{venueName}</span>
              <Badge variant="outline">
                {activeCheckIns.length}/3 venues
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              Stay checked in for 12 hours. You can be at up to 3 venues at once.
            </div>
            {activeCheckIns.length >= 3 && (
              <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <AlertCircle className="w-4 h-4 mr-1" />
                Check out of another venue first
              </div>
            )}
            <Button 
              onClick={handleCheckIn}
              disabled={loading || activeCheckIns.length >= 3}
              className="w-full"
            >
              {loading ? "Checking in..." : "Check In"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 