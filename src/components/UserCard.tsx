
import React, { useState, useEffect } from 'react';
import { User as UserType } from '@/types';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface UserCardProps {
  user: UserType;
  onExpressInterest: (userId: string) => void;
  hasPendingInterest?: boolean;
  hasMatch?: boolean;
  isLikedByUser?: boolean;
  className?: string;
  currentUser?: { id: string };
  interests?: any[];
  setInterests?: (interests: any[]) => void;
  matches?: any[];
  setMatches?: (matches: any[]) => void;
  setMatchedUser?: (user: UserType) => void;
  setShowMatchModal?: (show: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onExpressInterest, 
  hasPendingInterest = false,
  hasMatch = false,
  isLikedByUser = false,
  className,
  currentUser,
  interests = [],
  setInterests,
  matches = [],
  setMatches,
  setMatchedUser,
  setShowMatchModal
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(hasPendingInterest);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsLiked(hasPendingInterest);
  }, [hasPendingInterest]);

  const handleExpressInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Animation on heart click
    const target = e.currentTarget;
    target.classList.add('scale-120');
    setTimeout(() => {
      target.classList.remove('scale-120');
    }, 200);
    
    onExpressInterest(user.id);
  };
  
  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isProcessing) return;
    
    setIsProcessing(true);
    setIsLiked(true);
    
    // Create interest object
    const interest = {
      id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fromUserId: currentUser?.id || '',
      toUserId: user.id,
      venueId: user.currentVenue || '',
      timestamp: Date.now(),
      isActive: true,
      expiresAt: Date.now() + (3 * 60 * 60 * 1000) // 3 hours
    };
    
    // Add to interests array
    if (setInterests) {
      const updatedInterests = [...interests, interest];
      setInterests(updatedInterests);
      localStorage.setItem('interests', JSON.stringify(updatedInterests));
    }
    
    // Show toast notification
    toast({
      title: "Interest Sent!",
      description: `You've expressed interest in ${user.name}`,
    });
    
    // Check for match
    const hasMatch = interests.some(int => 
      int.fromUserId === user.id && 
      int.toUserId === (currentUser?.id || '') &&
      int.isActive
    );
    
    if (hasMatch && setMatches && setMatchedUser && setShowMatchModal) {
      // Create match object
      const match = {
        id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: currentUser?.id || '',
        matchedUserId: user.id,
        venueId: user.currentVenue || '',
        timestamp: Date.now(),
        isActive: true,
        expiresAt: Date.now() + (3 * 60 * 60 * 1000), // 3 hours
        contactShared: false
      };
      
      // Add to matches array
      const updatedMatches = [...matches, match];
      setMatches(updatedMatches);
      localStorage.setItem('matches', JSON.stringify(updatedMatches));
      
      // Show match notification
      setMatchedUser(user);
      setShowMatchModal(true);
    }
    
    // Also call the original handler for backward compatibility
    onExpressInterest(user.id);
    
    setIsProcessing(false);
  };
  
  return (
    <div 
      className={cn(
        "relative w-[100px] h-[140px] overflow-hidden rounded-xl bg-white border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] active:opacity-90",
        hasMatch && "shadow-[0_0_0_2px_rgba(58,134,255,0.1),0_2px_10px_rgba(0,0,0,0.08)]",
        isLikedByUser && "border-[#FF5A5F]/30",
        className
      )}
    >
      <div className="w-full h-full relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#F9FAFB] flex items-center justify-center">
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
        
        {/* Heart button with updated implementation */}
        <button
          onClick={handleLike}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isLiked || hasPendingInterest || hasMatch
              ? "bg-[#3A86FF] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
              : "bg-white/50 backdrop-blur-sm hover:bg-white/70"
          }`}
          aria-label="Express Interest"
          disabled={isProcessing}
        >
          <Heart 
            size={16} 
            className={isLiked || hasPendingInterest || hasMatch ? "fill-white text-white" : "text-white"} 
          />
        </button>
      </div>
      
      {hasMatch && (
        <div className="absolute top-2 right-2 py-1 px-2 bg-[#3A86FF] text-white text-[10px] font-medium rounded-full shadow-md animate-fade-in">
          Match!
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
