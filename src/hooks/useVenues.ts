
import { useState, useEffect } from 'react';
import { venues, getUsersAtVenue } from '@/data/mockData';
import { Venue, User } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import logger from '@/utils/Logger';

// Define types
interface VenueHookReturn {
  nearbyVenues: Venue[];
  currentVenue: Venue | null;
  usersAtVenue: User[];
  loading: boolean;
  checkInToVenue: (venueId: string, zoneName?: string) => void;
  checkOutFromVenue: () => void;
  isUserCheckedInToVenue: (venueId: string) => boolean;
}

// Main hook function
export function useVenues(): VenueHookReturn {
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Set venues from mock data
      setNearbyVenues([...venues]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load users at venue whenever currentVenue changes
  useEffect(() => {
    if (currentVenue) {
      const users = getUsersAtVenue(currentVenue.id);
      logger.info(`Loading ${users.length} users for venue ${currentVenue.id}`);
      setUsersAtVenue(users);
    } else {
      setUsersAtVenue([]);
    }
  }, [currentVenue]);

  // Check if user is checked in to a specific venue
  const isUserCheckedInToVenue = (venueId: string): boolean => {
    return currentVenue?.id === venueId;
  };

  // Check in to a venue
  const checkInToVenue = (venueId: string, zoneName?: string): void => {
    logger.info(`Checking in to venue: ${venueId}, zone: ${zoneName || 'default'}`);
    const venue = venues.find(v => v.id === venueId);
    
    if (venue) {
      setCurrentVenue(venue);
      
      // Load users at the venue - do this immediately to ensure we have users
      const users = getUsersAtVenue(venueId);
      logger.info(`Found ${users.length} users at venue ${venueId}`);
      setUsersAtVenue(users);
      
      // Notify user
      toast({
        title: zoneName ? `Checked into ${zoneName} at ${venue.name}` : `Checked into ${venue.name}`,
        description: "You're now visible at this venue for the next few hours.",
      });
      
      // Navigate to venue details page
      navigate(`/venue/${venueId}`);
    }
  };

  // Check out from a venue
  const checkOutFromVenue = (): void => {
    setCurrentVenue(null);
    setUsersAtVenue([]);
    
    toast({
      title: "Checked out",
      description: "You're no longer checked in to any venue.",
    });
    
    // Navigate back to venues list
    navigate('/venues');
  };

  return {
    nearbyVenues,
    currentVenue,
    usersAtVenue,
    loading,
    checkInToVenue,
    checkOutFromVenue,
    isUserCheckedInToVenue
  };
}
