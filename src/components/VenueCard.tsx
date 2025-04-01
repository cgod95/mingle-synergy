import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Venue {
  id: string;
  name: string;
  description: string;
  location: string;
  type?: string;
  image: string;
  address: string;
  checkInCount: number;
}

interface VenueCardProps {
  venue: Venue;
  className?: string;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, className }) => {
  return (
    <div
      className={cn(
        'p-4 border rounded-lg shadow-sm cursor-pointer',
        className
      )}
    >
      <img src={venue.image} alt={venue.name} className="w-full h-32 object-cover rounded-md mb-2" />
      <div className="text-lg font-semibold">{venue.name}</div>
      <div className="text-sm text-gray-600 flex items-center">
        <MapPin size={14} className="mr-1" />
        {venue.address}
      </div>
      <div className="text-xs text-gray-500 mt-1">{venue.description}</div>
    </div>
  );
};

export default VenueCard;