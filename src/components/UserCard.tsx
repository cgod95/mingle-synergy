import React, { useState, useEffect } from 'react';
import { User as UserType, Interest, Match } from '@/types';
import { Heart } from 'lucide-react';
import OptimizedImage from './shared/OptimizedImage';
import mockInterestService from '@/services/mock/mockInterestService';

interface UserCardProps {
  user: UserType;
  interests: Interest[];
  setInterests: React.Dispatch<React.SetStateAction<Interest[]>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  currentUser: { id: string; [key: string]: any };
  onExpressInterest?: (userId: string) => void;
  hasPendingInterest?: boolean;
  hasMatch?: boolean;
  isLikedByUser?: boolean;
  className?: string;
  setMatchedUser?: (user: UserType) => void;
  setShowMatchModal?: (show: boolean) => void;
  likesRemaining: number;
  setLikesRemaining: React.Dispatch<React.SetStateAction<number>>;
  venueId?: string;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  interests, 
  setInterests, 
  matches, 
  setMatches, 
  currentUser,
  className,
  likesRemaining,
  setLikesRemaining,
  venueId = 'unknown'
}) => {
  const isAlreadyLiked = interests.some(
    interest => interest.toUserId === user.id && interest.fromUserId === currentUser.id && interest.isActive
  );
  
  const [isLiked, setIsLiked] = useState(isAlreadyLiked);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const updateLikes = async () => {
      if (currentUser.id && venueId) {
        try {
          const remaining = await mockInterestService.getLikesRemaining(currentUser.id, venueId);
          setLikesRemaining(remaining);
        } catch (error) {
          console.error('Error loading likes:', error);
        }
      }
    };
    
    updateLikes();
  }, [currentUser.id, venueId, setLikesRemaining]);
  
  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isLiked) return;
    
    if (likesRemaining <= 0) {
      if (window.showToast) {
        window.showToast('You can only like 3 people per venue');
      }
      return;
    }
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    console.log("Heart clicked for user:", user.id);
    setIsLiked(true);
    
    const success = await mockInterestService.recordInterest(currentUser.id, user.id, venueId);
    
    if (success) {
      const remaining = await mockInterestService.getLikesRemaining(currentUser.id, venueId);
      setLikesRemaining(remaining);
      
      const newInterest = {
        id: `int_${Date.now()}`,
        fromUserId: currentUser.id,
        toUserId: user.id,
        venueId: user.currentVenue || venueId,
        timestamp: Date.now(),
        isActive: true,
        expiresAt: Date.now() + (3 * 60 * 60 * 1000)
      };
      
      setInterests(prev => [...prev, newInterest]);
      
      if (window.showToast) {
        window.showToast('Interest sent!');
      }
      
      const mutualInterest = interests.find(interest => 
        interest.fromUserId === user.id && 
        interest.toUserId === currentUser.id &&
        interest.isActive
      );
      
      if (mutualInterest) {
        const newMatch = {
          id: `match_${Date.now()}`,
          userId: currentUser.id,
          matchedUserId: user.id,
          venueId: user.currentVenue || venueId,
          timestamp: Date.now(),
          isActive: true,
          expiresAt: Date.now() + (3 * 60 * 60 * 1000),
          contactShared: false
        };
        
        setMatches(prev => [...prev, newMatch]);
        
        const savedMatches = JSON.parse(localStorage.getItem('matches') || '[]');
        savedMatches.push(newMatch);
        localStorage.setItem('matches', JSON.stringify(savedMatches));
        
        if (window.showMatchModal) {
          window.showMatchModal(user);
        }
      }
    }
  };
  
  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <OptimizedImage 
        src={user.photos?.[0]} 
        alt={user.name} 
        className="w-full aspect-square"
        width={300}
        height={300}
      />
      
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-2 px-2">
        <div className="text-white">
          <div className="font-medium">{user.name}</div>
          <div className="text-sm">{user.age}</div>
        </div>
      </div>
      
      <button 
        onClick={handleHeartClick}
        className={`absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full shadow-sm transition-all duration-200 ${
          isLiked 
            ? 'bg-pink-500 text-white' 
            : 'bg-white/80 text-gray-600 hover:bg-gray-100'
        } ${isAnimating ? 'scale-heart' : ''}`}
      >
        <Heart 
          size={20} 
          fill={isLiked ? "currentColor" : "none"} 
          strokeWidth={2}
        />
      </button>
      
      {likesRemaining < 3 && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {likesRemaining} likes left
        </div>
      )}
    </div>
  );
};

export default UserCard;
