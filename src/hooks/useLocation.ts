
import { useState, useEffect } from 'react';
import { venues } from '@/data/mockData';
import { Venue } from '@/types';

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true); // Mock always granted for demo

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
