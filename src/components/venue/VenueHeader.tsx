
import React from 'react';
import { Venue } from '@/types/Venue';
import { Clock } from 'lucide-react';

interface VenueHeaderProps {
  venue: Venue;
  onCheckOut: () => void;
  expiryTime?: number;
}

const VenueHeader: React.FC<VenueHeaderProps> = ({ venue, onCheckOut, expiryTime }) => {
  const formatTime = (timestamp?: number) => {
    if (!timestamp) {
      const now = new Date();
      const defaultExpiryDate = new Date(now.getTime() + (venue.expiryTime || 120) * 60 * 1000);
      return defaultExpiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">{venue.name}</h1>
          {venue.address && <p className="text-gray-600 text-sm">{venue.address}</p>}
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Clock size={16} className="mr-1.5" />
            <span>Expires at {formatTime(expiryTime)}</span>
          </div>
        </div>
        <button 
          onClick={onCheckOut}
          className="text-red-500 text-sm font-medium"
        >
          Check Out
        </button>
      </div>
    </div>
  );
};

export default VenueHeader;
