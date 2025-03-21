
import { useState, useEffect } from 'react';
import { venues } from '@/data/mockData';
import { Venue } from '@/types';
import { useToast } from "@/components/ui/use-toast";

// Define types
interface VenueHookReturn {
  nearbyVenues: Venue[];
  currentVenue: Venue | null;
  loading: boolean;
  checkInToVenue: (venueId: string, zoneName?: string) => void;
  checkOutFromVenue: () => void;
}

// Main hook function
export function useVenues(): VenueHookReturn {
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Set venues from mock data
      setNearbyVenues([...venues]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Check in to a venue
  const checkInToVenue = (venueId: string, zoneName?: string): void => {
    const venue = venues.find(v => v.id === venueId);
    
    if (venue) {
      setCurrentVenue(venue);
      
      // Notify user
      toast({
        title: zoneName ? `Checked into ${zoneName} at ${venue.name}` : `Checked into ${venue.name}`,
        description: "You're now visible at this venue for the next few hours.",
      });
    }
  };

  // Check out from a venue
  const checkOutFromVenue = (): void => {
    setCurrentVenue(null);
    
    toast({
      title: "Checked out",
      description: "You're no longer checked in to any venue.",
    });
  };

  return {
    nearbyVenues,
    currentVenue,
    loading,
    checkInToVenue,
    checkOutFromVenue
  };
}
