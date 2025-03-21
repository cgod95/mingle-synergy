
import { useState, useEffect } from 'react';
import { venues } from '@/data/mockData';
import { Venue } from '@/types';
import { useToast } from "@/components/ui/use-toast";

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true); // Mock always granted for demo
  const { toast } = useToast();

  useEffect(() => {
    // Simulate geolocation API
    const timer = setTimeout(() => {
      setLoading(false);
      
      // For demo purposes, simulate that the user is at venue v1
      const mockCurrentVenue = venues.find(v => v.id === 'v1');
      setCurrentVenue(mockCurrentVenue || null);
      
      // Sort venues to put current venue first, then others
      const sortedVenues = [...venues].sort((a, b) => {
        if (a.id === 'v1') return -1;
        if (b.id === 'v1') return 1;
        return 0;
      });
      
      setNearbyVenues(sortedVenues);

      // Simulate push notification for automatic venue detection
      if (mockCurrentVenue) {
        toast({
          title: `You're at ${mockCurrentVenue.name}`,
          description: "Would you like to check in?",
          action: (
            <button 
              onClick={() => window.location.href = `/venue/${mockCurrentVenue.id}`}
              className="bg-[#3A86FF] text-white px-4 py-2 rounded-lg text-sm"
            >
              Check In
            </button>
          ),
        });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock function to simulate requesting location permission
  const requestLocationPermission = () => {
    setLoading(true);
    
    // Simulate permission request
    setTimeout(() => {
      setPermissionGranted(true);
      setLoading(false);

      // Simulate a notification that permission was granted
      toast({
        title: "Location access granted",
        description: "We'll notify you when you're at a venue."
      });
    }, 500);
    
    return Promise.resolve(true);
  };

  return {
    currentLocation,
    nearbyVenues,
    currentVenue,
    loading,
    permissionGranted,
    requestLocationPermission
  };
}
