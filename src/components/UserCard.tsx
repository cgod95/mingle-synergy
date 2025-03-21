
import React, { useState, useEffect } from 'react';
import { User as UserType, Interest, Match } from '@/types';

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
  // Check if user is already liked based on interests
  const isAlreadyLiked = interests.some(
    interest => interest.toUserId === user.id && interest.fromUserId === currentUser.id && interest.isActive
  );
  
  const [isLiked, setIsLiked] = useState(isAlreadyLiked);
  
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // If already liked, don't do anything
    if (isLiked) return;
    
    // Check if user has likes remaining
    if (likesRemaining <= 0) {
      if (window.showToast) {
        window.showToast('You can only like 3 people per venue');
      }
      return;
    }
    
    console.log("Heart clicked for user:", user.id);
    setIsLiked(true);
    
    // Reduce likes remaining
    setLikesRemaining(prev => prev - 1);
    
    // Store in localStorage to persist across page loads
    localStorage.setItem(`likesRemaining-${venueId}`, String(likesRemaining - 1));
    
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
    
    const savedInterests = JSON.parse(localStorage.getItem('interests') || '[]');
    savedInterests.push(newInterest);
    localStorage.setItem('interests', JSON.stringify(savedInterests));
    
    if (window.showToast) {
      window.showToast('Interest sent!');
    }
    
    // Check for mutual interest
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
  };
  
  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <img 
        src={user.photos?.[0]} 
        alt={user.name} 
        className="w-full aspect-square object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="text-white">
          <div className="font-medium">{user.name}</div>
          <div className="text-sm">{user.age}</div>
        </div>
      </div>
      <button 
        onClick={handleHeartClick}
        className={`absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
          isLiked ? 'bg-pink-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-gray-100'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
  );
};

export default UserCard;
