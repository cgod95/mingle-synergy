
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
        "relative overflow-hidden rounded-xl bg-card shadow-sm border border-border/50 transition-all duration-300 animate-fade-in",
        hasMatch && "ring-2 ring-[#3A86FF]",
        isLikedByUser && "border-[#FF5A5F]/30",
        className
      )}
    >
      {isLikedByUser && !hasMatch && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-[#FF5A5F]/20 to-transparent h-16"></div>
      )}
      
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img 
          src={user.photos[0] + "?auto=format&fit=crop&w=600&q=80"} 
          alt={user.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">{user.name}</h3>
            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 max-w-[80%]">
                {user.interests.slice(0, 3).map((interest, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs px-2 py-0.5 bg-background/50 backdrop-blur-sm rounded-full text-white"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpressInterest(user.id);
            }}
            className={cn(
              "rounded-full p-2 transition-all duration-300",
              hasMatch 
                ? "bg-[#3A86FF] text-white" 
                : hasPendingInterest 
                  ? "bg-[#FF5A5F] text-white"
                  : "bg-background/40 backdrop-blur-sm text-white hover:bg-[#FF5A5F] hover:text-white"
            )}
            aria-label={hasMatch ? "Matched" : hasPendingInterest ? "Interest Sent" : "Express Interest"}
          >
            <Heart 
              size={20} 
              className={cn(
                hasMatch && "fill-white animate-pulse-once", 
                hasPendingInterest && "fill-white"
              )} 
            />
          </button>
        </div>
      </div>
      
      {hasMatch && (
        <div className="absolute top-2 right-2 py-1 px-2 bg-[#3A86FF] text-white text-xs rounded-full animate-fade-in">
          Match!
        </div>
      )}
      
      {isLikedByUser && !hasMatch && (
        <div className="absolute top-2 right-2 py-1 px-2 bg-[#FF5A5F] text-white text-xs rounded-full animate-fade-in">
          Likes you
        </div>
      )}
    </div>
  );
};

export default UserCard;
