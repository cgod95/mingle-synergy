import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import venueService from '@/services/firebase/venueService';
import { Venue } from '@/types/services';
import ErrorBoundary from '../components/ErrorBoundary';
import BottomNav from '../components/BottomNav';
import { useToast } from '@/hooks/use-toast';

export default function VenueList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const allVenues = await venueService.getVenues();
        setVenues(allVenues);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleCheckIn = async (venueId: string) => {
    try {
      setLoading(true);
      // await venueService.checkIn(venueId); // REMOVE this line for demo
      // Show success toast
      toast({
        title: "Checked in! 🎉",
        description: "You're now visible to others at this venue.",
        duration: 3000,
      });
      navigate(`/venue/${venueId}`);
    } catch (error) {
      console.error('Check-in failed:', error);
      // Show error toast
      toast({
        title: "Check-in failed",
        description: "Please try again in a moment.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading venues...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen p-4 space-y-4 bg-background">
        <h1 className="text-2xl font-bold text-center">Nearby Venues</h1>
        {venues.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>No venues found nearby</p>
          </div>
        ) : (
          venues.map((venue) => (
            <Card key={venue.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCheckIn(venue.id)}>
              <CardContent className="p-4 space-y-1">
                <h2 className="text-lg font-semibold">{venue.name}</h2>
                <p className="text-sm text-muted-foreground">{venue.city}</p>
                {venue.address && (
                  <p className="text-sm text-muted-foreground">{venue.address}</p>
                )}
                <p className="text-sm text-muted-foreground">{venue.checkInCount} people checked in</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <BottomNav />
    </ErrorBoundary>
  );
}
