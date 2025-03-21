
import React, { useState } from 'react';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleExpressInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Animation on heart click
    const target = e.currentTarget;
    target.classList.add('scale-120');
    setTimeout(() => {
      target.classList.remove('scale-120');
    }, 120);
    
    onExpressInterest(user.id);
  };
  
  return (
    <div 
      className={cn(
        "relative w-[100px] h-[140px] overflow-hidden rounded-xl bg-white border border-[#F1F5F9] shadow-[0px_4px_12px_rgba(0,0,0,0.05)] transition-opacity duration-100 hover:opacity-80 active:opacity-80",
        hasMatch && "ring-2 ring-[#3A86FF] shadow-[0_0_15px_rgba(58,134,255,0.25)]",
        isLikedByUser && "border-[#FF5A5F]/30",
        className
      )}
      onClick={() => onExpressInterest(user.id)}
    >
      <div className="w-full h-full relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#F1F5F9] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#3A86FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={user.photos[0] + "?auto=format&fit=crop&w=300&q=80"} 
          alt={user.name}
          className={`w-full h-full object-cover ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#202020]/80 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-end justify-between">
            <div className="overflow-hidden">
              <h3 className="text-[14px] font-medium text-white truncate">{user.name}</h3>
              <p className="text-[12px] text-white/80 truncate">{user.age}</p>
            </div>
          </div>
        </div>
        
        {/* Heart button */}
        <button
          onClick={handleExpressInterest}
          className={`absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-120 transform ${
            hasPendingInterest || hasMatch
              ? "bg-[#3A86FF]"
              : "bg-white/50 backdrop-blur-sm hover:bg-white/70"
          }`}
          aria-label="Express Interest"
        >
          <Heart 
            size={14} 
            className={hasPendingInterest || hasMatch ? "fill-white text-white" : "text-white"} 
          />
        </button>
      </div>
      
      {hasMatch && (
        <div className="absolute top-2 right-2 py-1 px-2 bg-[#3A86FF] text-white text-[10px] font-medium rounded-full shadow-md animate-fade-in">
          It's a Match
        </div>
      )}
      
      {isLikedByUser && !hasMatch && (
        <div className="absolute top-2 right-2 py-1 px-2 bg-[#FF5A5F] text-white text-[10px] font-medium rounded-full shadow-md animate-fade-in">
          Likes you
        </div>
      )}
    </div>
  );
};

export default UserCard;
