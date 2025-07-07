import React, { useState } from 'react';
import { Users, Heart, MapPin, Coffee, Wine, Utensils, Dumbbell, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUsersAtVenue } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from './shared/OptimizedImage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock } from 'lucide-react';
import { Venue } from '@/types';
import { analytics } from '@/services/analytics';

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
  
  const handleCardClick = () => {
    navigate(`/simple-venue/${venue.id}`);
  };
  
  const usersAtVenue = getUsersAtVenue(venue.id);
  const hasUsers = usersAtVenue.length > 0;
  
  const getVenueIcon = () => {
    switch (venue.category?.toLowerCase()) {
      case 'cafe': return <Coffee size={20} className="text-[#6B7280]" />;
      case 'bar': return <Wine size={20} className="text-[#6B7280]" />;
      case 'restaurant': return <Utensils size={20} className="text-[#6B7280]" />;
      case 'gym': return <Dumbbell size={20} className="text-[#6B7280]" />;
      default: return <MapPin size={20} className="text-[#6B7280]" />;
    }
  };

  const handleSelect = () => {
    // Track venue selection analytics
    analytics.track('venue_card_selected', {
      venueId: venue.id,
      venueName: venue.name,
      venueType: venue.type,
      userCount,
      timestamp: Date.now()
    });
    
    onSelect(venue.id);
  };

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Track check-in attempt analytics
    analytics.track('venue_check_in_attempted', {
      venueId: venue.id,
      venueName: venue.name,
      venueType: venue.type,
      userCount,
      timestamp: Date.now()
    });
    
    onCheckIn(venue.id);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${venue.name} - ${userCount} people checked in`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-neutral-900">
                  {venue.name}
                </h3>
                {venue.checkInCount > 10 && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full" role="status" aria-label="Popular venue">
                    Popular
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-neutral-600">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{venue.address}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-neutral-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span>{userCount} people</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{venue.type}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleCheckIn}
                disabled={isCheckedIn}
                className={`min-w-[100px] ${
                  isCheckedIn 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                aria-label={isCheckedIn ? `Already checked in to ${venue.name}` : `Check in to ${venue.name}`}
              >
                {isCheckedIn ? 'Checked In' : 'Check In'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check in to {venue.name}?</DialogTitle>
            <DialogDescription>
              Other users will be able to see you here for the next few hours.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="mt-2 sm:mt-0"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCheckIn}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default VenueCard;
