// VenueCard - Dark theme with brand purple

import React, { useState } from 'react';
import { Users, MapPin, Coffee, Wine, Utensils, Dumbbell, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Venue } from '@/types';

interface VenueCardProps {
  venue: Venue;
  onSelect: (venueId: string) => void;
  onCheckIn: (venueId: string) => void;
  isCheckedIn: boolean;
  userCount: number;
  index?: number;
}

const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  onSelect,
  onCheckIn,
  isCheckedIn,
  userCount,
  index = 0
}) => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const getVenueIcon = () => {
    switch (venue.category?.toLowerCase()) {
      case 'cafe': return <Coffee size={18} />;
      case 'bar': return <Wine size={18} />;
      case 'restaurant': return <Utensils size={18} />;
      case 'gym': return <Dumbbell size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmation(true);
  };

  const confirmCheckIn = () => {
    onCheckIn(venue.id);
    setShowConfirmation(false);
    navigate(`/venue/${venue.id}`);
  };
  
  return (
    <div className="w-full">
      <div 
        onClick={() => onSelect(venue.id)}
        className="bg-[#111118] rounded-2xl border border-[#2D2D3A] overflow-hidden hover:border-[#7C3AED]/50 transition-all cursor-pointer group"
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-white group-hover:text-[#A78BFA] transition-colors">
                  {venue.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{venue.address}</span>
              </div>
            </div>
            
            {venue.category && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a24] rounded-full text-[#9CA3AF]">
                {getVenueIcon()}
                <span className="text-xs font-medium">{venue.category}</span>
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-[#9CA3AF]">
                <span className="text-white font-medium">{userCount}</span> here
              </span>
            </div>
            {venue.distance && (
              <div className="flex items-center gap-1.5 text-[#6B7280]">
                <span>{venue.distance}km away</span>
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="px-4 pb-4">
          <Button
            size="lg"
            onClick={handleCheckIn}
            disabled={isCheckedIn}
            className={`w-full font-semibold h-12 rounded-xl ${
              isCheckedIn 
                ? 'bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30' 
                : 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/25'
            }`}
          >
            {isCheckedIn ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Checked In
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 mr-2" />
                Check In
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md bg-[#111118] border-[#2D2D3A]">
          <DialogHeader>
            <DialogTitle className="text-white">Check in to {venue.name}?</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              Other users will be able to see you here for the next few hours.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="border-[#2D2D3A] text-[#9CA3AF] hover:bg-[#1a1a24] hover:text-white"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmCheckIn}
              className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(VenueCard);
