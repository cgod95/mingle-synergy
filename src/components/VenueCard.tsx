
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, MapPin } from 'lucide-react';
import { Venue } from '@/types';
import { cn } from '@/lib/utils';

interface VenueCardProps {
  venue: Venue;
  className?: string;
  onCheckIn?: (venueId: string, zoneName?: string) => void;
  simplified?: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({ 
  venue, 
  className, 
  onCheckIn,
  simplified = false
}) => {
  const navigate = useNavigate();
  
  // Get timer based on venue type
  const getExpiryHours = (type: string) => {
    switch (type) {
      case 'cafe': return 1;
      case 'bar': return 3;
      case 'restaurant': return 2;
      case 'gym': return 2;
      default: return 3;
    }
  };
  
  const handleCardClick = () => {
    navigate(`/venue/${venue.id}`);
  };
  
  const handleCheckIn = (e: React.MouseEvent, zoneName?: string) => {
    e.stopPropagation();
    if (onCheckIn) {
      onCheckIn(venue.id, zoneName);
    } else {
      navigate(`/venue/${venue.id}`);
    }
  };
  
  // Predefined zones for each venue
  const getVenueZones = () => {
    if (venue.type === 'bar') {
      return [
        { id: 'entrance', name: 'Near Entrance' },
        { id: 'bar', name: 'At the Bar' },
      ];
    } else if (venue.type === 'restaurant') {
      return [
        { id: 'inside', name: 'Inside' },
        { id: 'outside', name: 'Outside' },
      ];
    } else if (venue.type === 'cafe') {
      return [
        { id: 'counter', name: 'Near Counter' },
        { id: 'seated', name: 'Seated Area' },
      ];
    } else if (venue.type === 'gym') {
      return [
        { id: 'weights', name: 'Weights Area' },
        { id: 'cardio', name: 'Cardio Section' },
      ];
    }
    return [];
  };
  
  const zones = getVenueZones();
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card shadow-sm border border-border/50 hover:shadow-md transition-all duration-300 cursor-pointer animate-scale-in",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={venue.image + "?auto=format&fit=crop&w=600&q=80"} 
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-medium text-foreground mb-1">{venue.name}</h3>
        
        <p className="text-sm text-muted-foreground mb-2 truncate">{venue.address}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-[#3A86FF] text-sm">
            <Users size={16} />
            <span>{venue.checkInCount} people</span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
            <Clock size={16} />
            <span>{getExpiryHours(venue.type)} hrs</span>
          </div>
        </div>
        
        {zones.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {zones.map((zone) => (
              <button
                key={zone.id}
                className="py-1.5 px-2 text-xs bg-[#002855]/10 text-[#002855] rounded-full hover:bg-[#3A86FF]/20 transition-colors flex items-center justify-center"
                onClick={(e) => handleCheckIn(e, zone.name)}
              >
                <MapPin size={12} className="mr-1" /> {zone.name}
              </button>
            ))}
            <button
              className="py-1.5 px-2 text-xs bg-[#3A86FF] text-white rounded-full hover:bg-[#3A86FF]/90 transition-colors flex items-center justify-center col-span-2"
              onClick={(e) => handleCheckIn(e)}
            >
              Quick Check In
            </button>
          </div>
        ) : (
          <button
            className="w-full py-2 bg-[#3A86FF] text-white rounded-lg hover:bg-[#3A86FF]/90 transition-colors flex items-center justify-center"
            onClick={(e) => handleCheckIn(e)}
          >
            Check In
          </button>
        )}
      </div>
    </div>
  );
};

export default VenueCard;
