import React from 'react';
import { Users, Clock, MapPin, LogIn, LogOut } from 'lucide-react';
import { Venue } from '@/types';
import { cn } from '@/lib/utils';
import { getUsersAtVenue } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface VenueCardProps {
  venue: Venue;
  className?: string;
  onCheckIn?: (venueId: string, zoneName?: string) => void;
  onCheckOut?: () => void;
  isCheckedIn?: boolean;
  simplified?: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({ 
  venue, 
  className, 
  onCheckIn,
  onCheckOut,
  isCheckedIn = false,
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
    if (isCheckedIn && onCheckOut) {
      // Don't do anything on card click if already checked in
      return;
    } else {
      // Navigate directly to SimpleVenueView
      navigate(`/simple-venue/${venue.id}`);
    }
  };
  
  const handleCheckIn = (e: React.MouseEvent, zoneName?: string) => {
    e.stopPropagation();
    // Navigate directly to SimpleVenueView instead of using onCheckIn
    navigate(`/simple-venue/${venue.id}`);
  };
  
  const handleCheckOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCheckOut) {
      onCheckOut();
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
        { id: 'outside', name: 'Outside' },
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

  // Get users at this venue for preview
  const usersAtVenue = getUsersAtVenue(venue.id);
  const hasUsers = usersAtVenue.length > 0;
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card shadow-card border border-border/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer animate-scale-in",
        isCheckedIn && "ring-2 ring-[#3A86FF] shadow-[0_0_15px_rgba(58,134,255,0.25)]",
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
      
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-medium text-foreground mb-1">{venue.name}</h3>
        
        <p className="text-sm text-muted-foreground mb-3 truncate">{venue.address}</p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-[#3A86FF] text-sm font-medium">
            <Users size={16} className="stroke-[2.5px]" />
            <span>{venue.checkInCount} people</span>
          </div>
          
          <div className="flex items-center space-x-1.5 text-muted-foreground text-sm">
            <Clock size={16} />
            <span>{getExpiryHours(venue.type)} hrs</span>
          </div>
        </div>
        
        {/* Preview of people at venue */}
        {hasUsers && (
          <div className="flex mb-3 -space-x-2 overflow-hidden">
            {usersAtVenue.slice(0, 5).map((user) => (
              <div key={user.id} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                <img 
                  src={user.photos[0] + "?w=100&h=100&q=80"} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {usersAtVenue.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-primary/90 border-2 border-background flex items-center justify-center text-xs font-medium text-white">
                +{usersAtVenue.length - 5}
              </div>
            )}
          </div>
        )}
        
        {isCheckedIn ? (
          <button
            className="w-full py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-none transform hover:translate-y-0.5 flex items-center justify-center"
            onClick={handleCheckOut}
          >
            <LogOut size={16} className="mr-2" /> Check Out
          </button>
        ) : (
          <button
            className="w-full py-2.5 bg-[#3A86FF] text-white rounded-lg hover:bg-[#3A86FF]/90 transition-all duration-300 shadow-button hover:shadow-none transform hover:translate-y-0.5 flex items-center justify-center"
            onClick={(e) => handleCheckIn(e)}
          >
            <LogIn size={16} className="mr-2" /> View People Here
          </button>
        )}
      </div>
    </div>
  );
};

export default VenueCard;
