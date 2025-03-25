
import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../ui/OptimizedImage';

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    address?: string;
    photo?: string;
    image?: string;
    checkInCount: number;
    userCount?: number;
    distance?: string;
    type?: string;
  };
  onCheckIn: (venueId: string) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onCheckIn }) => {
  const userCount = venue.userCount || venue.checkInCount || 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
      {(venue.photo || venue.image) && (
        <div className="aspect-video relative overflow-hidden">
          <OptimizedImage
            src={venue.photo || venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{venue.name}</h3>
        {venue.address && <p className="text-gray-600 text-sm mb-2">{venue.address}</p>}
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656.126-1.283.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{userCount} people here</span>
          
          {venue.distance && (
            <>
              <span className="mx-2">•</span>
              <span>{venue.distance}</span>
            </>
          )}
        </div>
        
        <button
          onClick={() => onCheckIn(venue.id)}
          className="w-full py-2 bg-coral-500 text-white rounded-full font-medium"
        >
          Check In
        </button>
      </div>
    </div>
  );
};

export default VenueCard;
