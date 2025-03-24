
import React from 'react';
import { Users } from 'lucide-react';

interface VenueDetailsProps {
  venue: {
    name: string;
    address?: string;
    city?: string;
    userCount: number;
  };
  expiryTime: string;
  onCheckOut: () => void;
}

const VenueDetails: React.FC<VenueDetailsProps> = ({ venue, expiryTime, onCheckOut }) => {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold">{venue.name}</h1>
          <p className="text-gray-600 text-sm">
            {venue.address || venue.city || ''}
          </p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Users className="w-4 h-4 mr-1" />
            {venue.userCount} people here now
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Expires at {expiryTime}</div>
          <button 
            onClick={onCheckOut}
            className="text-red-500 text-sm font-medium mt-1"
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
