import React from 'react';
import { Users, MapPin, Coffee, Wine, Utensils, Dumbbell } from 'lucide-react';
import { getUsersAtVenue } from '@/data/mockData';
import { Button } from '@/components/ui/button';
// Removed motion import to prevent flickering from animations
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
  const usersAtVenue = getUsersAtVenue(venue.id);
  const hasUsers = usersAtVenue.length > 0;
  
  return (
    <div className="w-full">
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
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {venue.description}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(venue.id)}
              className="w-full"
            >
              View Details
            </Button>
            
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent re-renders
export default React.memo(VenueCard);
