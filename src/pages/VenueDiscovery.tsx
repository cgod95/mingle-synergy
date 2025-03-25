
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { locationService } from '../services/locationService';
import VenueCard from '../components/venues/VenueCard';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import NetworkStatus from '../components/ui/NetworkStatus';
import OptimizedImage from '../components/shared/OptimizedImage';

const VenueDiscovery: React.FC = () => {
  const [venues, setVenues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [category, setCategory] = useState<string>('all');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const position = await locationService.getCurrentPosition();
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setError('Unable to access your location. Please enable location services.');
      }
    };
    
    fetchUserLocation();
  }, []);
  
  useEffect(() => {
    const fetchVenues = async () => {
      if (!userLocation) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would use venueService.getNearbyVenues
        // For demo purposes, we'll use mock data
        const mockVenues = [
          {
            id: 'v1',
            name: 'The Grand Cafe',
            address: '123 Main Street, New York',
            image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
            type: 'cafe',
            checkInCount: 12,
            distance: '0.3 miles'
          },
          {
            id: 'v2',
            name: 'Skybar Lounge',
            address: '456 High Street, New York',
            image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
            type: 'bar',
            checkInCount: 23,
            distance: '0.7 miles'
          },
          {
            id: 'v3',
            name: 'The Italian Place',
            address: '789 Food Street, New York',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
            type: 'restaurant',
            checkInCount: 8,
            distance: '1.2 miles'
          },
          {
            id: 'v4',
            name: 'Downtown Club',
            address: '101 Night Avenue, New York',
            image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
            type: 'club',
            checkInCount: 45,
            distance: '1.8 miles'
          }
        ];
        
        // Filter by category if not 'all'
        const filteredVenues = category === 'all' 
          ? mockVenues 
          : mockVenues.filter(venue => venue.type === category);
        
        setVenues(filteredVenues);
      } catch (error) {
        console.error('Error fetching venues:', error);
        setError('Unable to load venues. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVenues();
  }, [userLocation, category]);
  
  const handleCheckIn = async (venueId: string) => {
    if (!currentUser) return;
    
    try {
      // In a real app, this would call venueService.checkInToVenue
      console.log(`Checking in to venue ${venueId}`);
      
      // Navigate to venue details page
      navigate(`/simple-venue/${venueId}`);
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };
  
  const categoryOptions = [
    { id: 'all', name: 'All' },
    { id: 'cafe', name: 'Cafes' },
    { id: 'restaurant', name: 'Restaurants' },
    { id: 'bar', name: 'Bars' },
    { id: 'club', name: 'Clubs' }
  ];
  
  if (isLoading) {
    return <LoadingState message="Finding venues near you..." />;
  }
  
  return (
    <div className="bg-bg-primary min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-bg-secondary shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-text-primary">Discover Venues</h1>
        </div>
      </header>
      
      {/* Category filter */}
      <div className="px-4 py-4 mb-2">
        <div className="overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categoryOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setCategory(option.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  category === option.id 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-bg-tertiary text-text-secondary'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {error ? (
        <div className="px-4 py-12 bg-bg-tertiary rounded-lg mx-4 text-center">
          <p className="text-text-secondary font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-full text-sm"
          >
            Try Again
          </button>
        </div>
      ) : venues.length === 0 ? (
        <div className="px-4 py-12 bg-bg-tertiary rounded-lg mx-4 text-center">
          <p className="text-text-primary font-medium">No venues found nearby</p>
          <p className="text-text-secondary text-sm mt-1">Try adjusting your filters or searching in a different area</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {venues.map(venue => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onCheckIn={() => handleCheckIn(venue.id)}
            />
          ))}
        </div>
      )}
      
      <NetworkStatus />
    </div>
  );
};

export default VenueDiscovery;
