
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';
import { Venue } from '@/types';
import { cn } from '@/lib/utils';

interface VenueCardProps {
  venue: Venue;
  className?: string;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, className }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/venue/${venue.id}`);
  };
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card shadow-sm border border-border/50 hover:shadow-md transition-all duration-300 cursor-pointer animate-scale-in",
        className
      )}
      onClick={handleClick}
    >
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={venue.image + "?auto=format&fit=crop&w=600&q=80"} 
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-medium text-foreground mb-1">{venue.name}</h3>
        
        <p className="text-sm text-muted-foreground mb-2 truncate">{venue.address}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-primary text-sm">
            <Users size={16} />
            <span>{venue.checkInCount} people</span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
            <Clock size={16} />
            <span>{venue.expiryTime / 60} hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
