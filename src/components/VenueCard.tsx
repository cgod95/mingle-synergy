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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="w-full"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg">{venue.name}</h3>
                {venue.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{venue.rating}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                <span>{venue.address}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{userCount} active</span>
                </div>
                {venue.distance && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{venue.distance}km away</span>
                  </div>
                )}
              </div>
            </div>
            
            {venue.category && (
              <Badge variant="secondary" className="ml-2">
                {venue.category}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {venue.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground mb-4 line-clamp-2"
            >
              {venue.description}
            </motion.p>
          )}

          <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(venue.id)}
                className="flex-1"
              >
                View Details
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={handleCheckIn}
                disabled={isCheckedIn}
                className="flex-1"
              >
                {isCheckedIn ? (
                  <>
                    <Clock className="w-4 h-4 mr-1" />
                    Checked In
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-1" />
                    Check In
                  </>
                )}
              </Button>
            </motion.div>
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
              onClick={confirmCheckIn}
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
