
import { useState, useEffect } from 'react';
import { venues } from '@/data/mockData';
import { Venue } from '@/types';
import { useToast } from "@/components/ui/use-toast";

// Define types
interface LocationHookReturn {
  currentLocation: GeolocationCoordinates | null;
  nearbyVenues: Venue[];
  currentVenue: Venue | null;
  loading: boolean;
  permissionGranted: boolean;
  requestLocationPermission: () => Promise<boolean>;
}

// Calculate distance between two coordinates in kilometers
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Main hook function
export function useLocation(): LocationHookReturn {
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { toast } = useToast();

  // Check if user is at a venue (mock implementation)
  const determineCurrentVenue = (userLocation: GeolocationCoordinates): Venue | null => {
    // For demo purposes, we're simulating that the user is at venue v1
    // In a real implementation, you would calculate distance to each venue
    // and determine if user is within a certain threshold
    return venues.find(v => v.id === 'v1') || null;
  };

  // Sort venues by proximity to user
  const sortVenuesByProximity = (location: GeolocationCoordinates): Venue[] => {
    // In a real implementation, this would sort venues by actual distance
    // For now, we'll just simulate by prioritizing the current venue
    return [...venues].sort((a, b) => {
      if (a.id === 'v1') return -1;
      if (b.id === 'v1') return 1;
      return 0;
    });
  };

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    // For demo purposes, we'll simulate geolocation
    // In a real app, you would use navigator.geolocation.getCurrentPosition
    const timer = setTimeout(() => {
      setLoading(false);
      setPermissionGranted(true);
      
      // Create mock location (simulating the browser's geolocation API)
      const mockLocation = {
        coords: {
          latitude: 34.0522,
          longitude: -118.2437,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };
      
      // Set current location
      setCurrentLocation(mockLocation.coords);
      
      // Determine current venue and nearby venues
      const detectedVenue = determineCurrentVenue(mockLocation.coords);
      setCurrentVenue(detectedVenue);
      
      // Sort venues by proximity
      const sortedVenues = sortVenuesByProximity(mockLocation.coords);
      setNearbyVenues(sortedVenues);

      // Notify user about detected venue
      if (detectedVenue) {
        toast({
          title: `You're at ${detectedVenue.name}`,
          description: "Would you like to check in?",
          action: (
            <button 
              onClick={() => window.location.href = `/venue/${detectedVenue.id}`}
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
  const requestLocationPermission = (): Promise<boolean> => {
    setLoading(true);
    
    // Simulate permission request
    return new Promise((resolve) => {
      setTimeout(() => {
        setPermissionGranted(true);
        setLoading(false);

        // Simulate a notification that permission was granted
        toast({
          title: "Location access granted",
          description: "We'll notify you when you're at a venue."
        });
        
        resolve(true);
      }, 500);
    });
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
