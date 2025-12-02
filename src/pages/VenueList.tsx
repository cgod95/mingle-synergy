import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockVenues } from '@/data/mock';
import ErrorBoundary from '../components/ErrorBoundary';
import BottomNav from '../components/BottomNav';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { GridSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Clock } from 'lucide-react';
import VenueCard from '@/components/VenueCard';
import { logError } from '@/utils/errorHandler';
import { isCheckedIn } from '@/lib/checkinStore';

export default function VenueList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        // Use mock data directly in demo mode
        setVenues(mockVenues);
      } catch (err) {
        logError(err as Error, { source: 'VenueList', action: 'fetchVenues' });
        setError('Failed to load venues');
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
      logError(error as Error, { source: 'VenueList', action: 'handleCheckIn', venueId });
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
      <Layout>
        <div className="space-y-8 pb-24">
          <div className="space-y-4">
            <h1 className="text-heading-1">Venues</h1>
            <p className="text-body-secondary">Find your next connection</p>
          </div>
          <GridSkeleton cols={1} rows={6} />
        </div>
        <BottomNav />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh] pb-24">
          <div className="text-center space-y-4">
            <p className="text-neutral-600">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
        <BottomNav />
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
        <div className="space-y-8 pb-24">
          <div className="space-y-4">
            <h1 className="text-heading-1">Venues</h1>
            <p className="text-body-secondary">Find your next connection</p>
          </div>
          
          <div className="space-y-4">
            {venues.map((venue, idx) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onSelect={(id) => navigate(`/simple-venue/${id}`)}
                onCheckIn={(id) => handleCheckIn(id)}
                isCheckedIn={isCheckedIn(venue.id)}
                userCount={venue.checkInCount || 0}
                index={idx}
              />
            ))}
          </div>
        </div>
      </Layout>
      <BottomNav />
    </ErrorBoundary>
  );
}
