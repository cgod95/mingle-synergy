
import React from 'react';
import { User as UserType } from '@/types';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: UserType;
  onExpressInterest: (userId: string) => void;
  hasPendingInterest?: boolean;
  hasMatch?: boolean;
  isLikedByUser?: boolean;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onExpressInterest, 
  hasPendingInterest = false,
  hasMatch = false,
  isLikedByUser = false,
  className 
}) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border/30 transition-all duration-300 animate-fade-in shadow-sm hover:shadow-card",
        hasMatch && "ring-2 ring-[#3A86FF] shadow-[0_0_15px_rgba(58,134,255,0.25)]",
        isLikedByUser && "border-[#FF5A5F]/30",
        className
      )}
      onClick={() => onExpressInterest(user.id)}
    >
      <div className="aspect-[3/4] w-full overflow-hidden relative">
        <img 
          src={user.photos[0] + "?auto=format&fit=crop&w=600&q=80"} 
          alt={user.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-base font-medium text-white">{user.name}</h3>
              {user.zone && (
                <div className="flex items-center mt-1 text-xs text-white/80">
                  <span>{user.zone}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpressInterest(user.id);
              }}
              className={cn(
                "rounded-full p-2 transition-all duration-300 transform hover:scale-110 active:scale-90",
                hasMatch 
                  ? "bg-[#3A86FF] text-white shadow-[0_0_15px_rgba(58,134,255,0.3)]" 
                  : hasPendingInterest 
                    ? "bg-[#FF5A5F] text-white shadow-[0_0_15px_rgba(255,90,95,0.3)]"
                    : "bg-background/60 backdrop-blur-sm text-white hover:bg-[#FF5A5F] hover:text-white",
                hasMatch && "animate-heart-beat"
              )}
              aria-label={hasMatch ? "Matched" : hasPendingInterest ? "Interest Sent" : "Express Interest"}
            >
              <Heart 
                size={18} 
                className={cn(
                  "transition-transform",
                  hasMatch && "fill-white", 
                  hasPendingInterest && "fill-white"
                )} 
              />
            </button>
          </div>
        </div>
      </div>
      
      {hasMatch && (
        <div className="absolute top-2 right-2 py-1 px-2 bg-[#3A86FF] text-white text-xs font-medium rounded-full shadow-md animate-fade-in">
          Match!
        </div>
      )}
      
      {isLikedByUser && !hasMatch && (
        <div className="absolute top-2 right-2 py-1 px-2 bg-[#FF5A5F] text-white text-xs font-medium rounded-full shadow-md animate-fade-in">
          Likes you
        </div>
      )}
    </div>
  );
};

export default UserCard;
