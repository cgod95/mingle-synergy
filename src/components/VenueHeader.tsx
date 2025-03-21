
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '@/types';
import { ArrowLeft, Users, Clock } from 'lucide-react';

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
}) => {
  const navigate = useNavigate();

  const formatExpiryTime = () => {
    const now = new Date();
    const expiryDate = expiryTime || new Date(now.getTime() + venue.expiryTime * 60 * 1000);
    
    // Format as "4:37 PM"
    return expiryDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#F1F5F9] p-4 mb-6 shadow-[0px_2px_8px_rgba(0,0,0,0.05)] max-h-[120px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/venues')}
            className="mr-3 text-[#505050] hover:text-[#202020]"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-[18px] font-semibold text-[#202020] truncate">{venue.name}</h1>
            <p className="text-[14px] text-[#505050] truncate">{venue.address}</p>
          </div>
        </div>
        
        <button
          onClick={onCheckOut}
          className="text-[14px] text-[#EF4444] hover:text-[#EF4444]/80 transition-colors"
        >
          Check Out
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center text-[#3A86FF] text-[14px]">
          <Users size={16} className="mr-1.5" />
          <span>{venue.checkInCount} people</span>
        </div>
        
        <div className="flex items-center text-[#505050] text-[14px]">
          <Clock size={16} className="mr-1.5" />
          <span>Expires {formatExpiryTime()}</span>
        </div>
      </div>
    </div>
  );
};

export default VenueHeader;
