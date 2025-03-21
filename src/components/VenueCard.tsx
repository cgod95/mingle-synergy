
import React from 'react';
import { Users, Heart, MapPin, Coffee, Wine, Utensils, Dumbbell } from 'lucide-react';
import { Venue } from '@/types';
import { cn } from '@/lib/utils';
import { getUsersAtVenue } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface VenueCardProps {
  venue: Venue;
  className?: string;
  isCheckedIn?: boolean;
  onCheckIn?: (venueId: string, zoneName?: string) => void;
  onCheckOut?: () => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ 
  venue, 
  className,
  isCheckedIn,
  onCheckIn,
  onCheckOut
}) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Navigate directly to SimpleVenueView for reliable user display
    navigate(`/simple-venue/${venue.id}`);
  };
  
  // Get users at this venue for preview
  const usersAtVenue = getUsersAtVenue(venue.id);
  const hasUsers = usersAtVenue.length > 0;
  
  // Get venue type icon
  const getVenueIcon = () => {
    switch (venue.type?.toLowerCase()) {
      case 'cafe': return <Coffee size={20} className="text-[#6B7280]" />;
      case 'bar': return <Wine size={20} className="text-[#6B7280]" />;
      case 'restaurant': return <Utensils size={20} className="text-[#6B7280]" />;
      case 'gym': return <Dumbbell size={20} className="text-[#6B7280]" />;
      default: return <MapPin size={20} className="text-[#6B7280]" />;
    }
  };
  
  return (
    <div 
      className={cn(
        "group venue-card animate-scale-in",
        isCheckedIn && "shadow-[0_0_0_2px_rgba(58,134,255,0.1),0_2px_10px_rgba(0,0,0,0.08)]",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="aspect-video w-full overflow-hidden relative">
        {/* Venue type icon */}
        <div className="absolute top-3 right-3 bg-white/80 w-8 h-8 flex items-center justify-center rounded-full z-10 shadow-sm">
          {getVenueIcon()}
        </div>
        
        {/* Venue image */}
        <img 
          src={venue.image + "?auto=format&fit=crop&w=600&q=80"} 
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#202020]/80 via-transparent to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-heading text-white mb-1">{venue.name}</h3>
        
        <p className="text-caption text-white/90 mb-3 truncate">{venue.address}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-[#3A86FF] text-caption font-medium">
            <Users size={16} className="stroke-[2.5px]" />
            <span>{venue.checkInCount} people</span>
          </div>
        </div>
        
        {/* Enhanced preview of people at venue */}
        {hasUsers && (
          <div className="flex mb-4 -space-x-2 overflow-hidden">
            {usersAtVenue.slice(0, 4).map((user) => (
              <div key={user.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                <img 
                  src={user.photos[0] + "?w=100&h=100&q=80"} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {usersAtVenue.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-[#3A86FF] border-2 border-white flex items-center justify-center text-[10px] font-medium text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                +{usersAtVenue.length - 4}
              </div>
            )}
          </div>
        )}
        
        <button
          className="w-full py-3 bg-[#3A86FF] text-white rounded-full hover:brightness-105 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_10px_rgba(58,134,255,0.2)] hover:shadow-[0_1px_5px_rgba(58,134,255,0.15)] text-button flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <Heart size={16} className="mr-2" /> View People Here
        </button>
      </div>
    </div>
  );
};

export default VenueCard;
