
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '@/types';
import { ArrowLeft, Users, Clock, Coffee, Wine, Utensils, Dumbbell, MapPin } from 'lucide-react';

interface VenueHeaderProps {
  venue: Venue;
  onCheckOut: () => void;
  isCheckedIn?: boolean;
  isVisible?: boolean;
  activeZone?: string | null;
  timeRemaining?: number;
  expiryTime?: Date;
  onZoneSelect?: (zoneName: string) => void;
  onToggleVisibility?: () => void;
}

const VenueHeader: React.FC<VenueHeaderProps> = ({
  venue,
  onCheckOut,
  isCheckedIn,
  isVisible,
  activeZone,
  timeRemaining,
  expiryTime,
  onZoneSelect,
  onToggleVisibility
}) => {
  const navigate = useNavigate();

  const formatExpiryTime = () => {
    const now = new Date();
    const expiryDate = expiryTime || new Date(now.getTime() + (venue.expiryTime || 120) * 60 * 1000);
    
    // Format as "4:37 PM"
    return expiryDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining) return '';
    
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    
    return `${hours}h ${minutes}m remaining`;
  };
  
  // Get venue type icon
  const getVenueIcon = () => {
    switch (venue.type?.toLowerCase()) {
      case 'cafe': return <Coffee size={18} className="text-[#6B7280]" />;
      case 'bar': return <Wine size={18} className="text-[#6B7280]" />;
      case 'restaurant': return <Utensils size={18} className="text-[#6B7280]" />;
      case 'gym': return <Dumbbell size={18} className="text-[#6B7280]" />;
      default: return <MapPin size={18} className="text-[#6B7280]" />;
    }
  };

  return (
    <div className="card-premium max-h-[120px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/venues')}
            className="mr-3 text-[#202020] hover:text-black btn-icon"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center">
              <h1 className="text-heading text-[#202020] truncate">{venue.name}</h1>
              <div className="ml-2 bg-gray-100 p-1 rounded-full">
                {getVenueIcon()}
              </div>
            </div>
            <p className="text-caption text-[#6B7280] truncate">{venue.address}</p>
          </div>
        </div>
        
        <button
          onClick={onCheckOut}
          className="text-caption text-[#EF4444] hover:text-[#EF4444]/80 transition-colors"
        >
          Check Out
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center text-[#3A86FF] text-caption">
          <Users size={16} className="mr-1.5" />
          <span>{venue.checkInCount} people</span>
        </div>
        
        <div className="flex items-center text-[#6B7280] text-caption">
          <Clock size={16} className="mr-1.5" />
          <span>Expires {formatExpiryTime()}</span>
        </div>
      </div>
    </div>
  );
};

export default VenueHeader;
