
import React from 'react';
import { Users, Heart, MapPin } from 'lucide-react';
import { Venue } from '@/types';
import { cn } from '@/lib/utils';
import { getUsersAtVenue } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface VenueCardProps {
  venue: Venue;
  className?: string;
}

const VenueCard: React.FC<VenueCardProps> = ({ 
  venue, 
  className
}) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Navigate directly to SimpleVenueView
    navigate(`/simple-venue/${venue.id}`);
  };
  
  // Get users at this venue for preview
  const usersAtVenue = getUsersAtVenue(venue.id);
  const hasUsers = usersAtVenue.length > 0;
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white border border-[#F1F5F9]/80 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer animate-scale-in",
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
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#202020]/80 via-transparent to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-xl font-semibold text-white mb-1">{venue.name}</h3>
        
        <p className="text-sm text-white/90 mb-3 truncate">{venue.address}</p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-[#3A86FF] text-sm font-medium">
            <Users size={16} className="stroke-[2.5px]" />
            <span>{venue.checkInCount} people</span>
          </div>
        </div>
        
        {/* Preview of people at venue */}
        {hasUsers && (
          <div className="flex mb-3 -space-x-2 overflow-hidden">
            {usersAtVenue.slice(0, 5).map((user) => (
              <div key={user.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                <img 
                  src={user.photos[0] + "?w=100&h=100&q=80"} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {usersAtVenue.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-[#3A86FF] border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                +{usersAtVenue.length - 5}
              </div>
            )}
          </div>
        )}
        
        <button
          className="w-full py-2.5 bg-[#3A86FF] text-white rounded-lg hover:bg-[#3A86FF]/90 transition-all duration-300 shadow-[0_2px_10px_rgba(58,134,255,0.2)] hover:shadow-none transform hover:translate-y-0.5 flex items-center justify-center"
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
