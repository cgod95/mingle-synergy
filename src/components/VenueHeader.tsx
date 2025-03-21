
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '@/types';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import CheckInTimer from './CheckInTimer';
import ZoneSelector from './ZoneSelector';
import ToggleButton from './ToggleButton';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface VenueHeaderProps {
  venue: Venue;
  isCheckedIn: boolean;
  isVisible: boolean;
  activeZone: string | null;
  timeRemaining: number;
  expiryTime: Date;
  onCheckOut: () => void;
  onZoneSelect: (zoneName: string) => void;
  onToggleVisibility: () => void;
}

const VenueHeader: React.FC<VenueHeaderProps> = ({
  venue,
  isCheckedIn,
  isVisible,
  activeZone,
  timeRemaining,
  expiryTime,
  onCheckOut,
  onZoneSelect,
  onToggleVisibility,
}) => {
  const navigate = useNavigate();

  // Venue zones based on venue type
  const getVenueZones = () => {
    if (!venue) return [];
    
    if (venue.type === 'bar') {
      return [
        { id: 'entrance', name: 'Near Entrance' },
        { id: 'bar', name: 'At the Bar' },
        { id: 'upstairs', name: 'Upstairs' }
      ];
    } else if (venue.type === 'restaurant') {
      return [
        { id: 'inside', name: 'Inside' },
        { id: 'outside', name: 'Outside' },
        { id: 'bar', name: 'At the Bar' }
      ];
    } else if (venue.type === 'cafe') {
      return [
        { id: 'counter', name: 'Near Counter' },
        { id: 'seated', name: 'Seated Area' },
        { id: 'outside', name: 'Outside' }
      ];
    } else if (venue.type === 'gym') {
      return [
        { id: 'weights', name: 'Weights Area' },
        { id: 'cardio', name: 'Cardio Section' },
        { id: 'studio', name: 'Studio Classes' }
      ];
    }
    return [];
  };
  
  const zones = getVenueZones();

  return (
    <div className="mb-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-semibold">{venue.name}</h1>
      </div>
      
      <Card className="p-4 bg-card shadow-sm border border-border/30 rounded-xl mb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{venue.address}</p>
            <div className="flex items-center text-[#3A86FF] text-sm">
              <Users className="mr-1" size={16} />
              <span className="font-medium">{venue.checkInCount} people here now</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            {isCheckedIn && (
              <>
                <CheckInTimer 
                  timeRemaining={timeRemaining}
                  expiryTime={expiryTime}
                />
                <button
                  onClick={onCheckOut}
                  className="text-xs text-red-500 hover:text-red-600 mt-1 transition-colors"
                >
                  Check Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Visibility toggle */}
        <div className="mt-3 mb-1">
          <ToggleButton 
            isVisible={isVisible} 
            onToggle={onToggleVisibility}
            className="scale-90 origin-left"
          />
        </div>
      </Card>
      
      {/* Zone Selector */}
      {isCheckedIn && zones.length > 0 && (
        <ZoneSelector
          zones={zones}
          activeZone={activeZone}
          onZoneSelect={onZoneSelect}
          className="mb-4"
        />
      )}
    </div>
  );
};

export default VenueHeader;
