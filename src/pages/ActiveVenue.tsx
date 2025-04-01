import React from 'react';
import VenueCard from '@/components/VenueCard';
import ErrorBoundary from '@/components/ErrorBoundary';

const venues = [
  { 
    id: '1', 
    name: 'Sunset Bar', 
    description: 'Live music every night', 
    location: 'Sydney', 
    image: '/images/sunset-bar.jpg', 
    address: '123 Sunset Blvd, Sydney', 
    checkInCount: 120 
  },
  { 
    id: '2', 
    name: 'Luna Lounge', 
    description: 'Cocktails & DJs', 
    location: 'Melbourne', 
    image: '/images/luna-lounge.jpg', 
    address: '456 Moonlight Ave, Melbourne', 
    checkInCount: 85 
  },
];

const ActiveVenuePage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Active Venues</h1>
        <div className="space-y-4">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ActiveVenuePage;