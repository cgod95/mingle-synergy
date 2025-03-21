
import React, { useState } from 'react';
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
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  interests, 
  setInterests, 
  matches, 
  setMatches, 
  currentUser,
  className
}) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Heart clicked for user:", user.id);
    setIsLiked(true);
    
    const newInterest = {
      id: `int_${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId: user.id,
      venueId: user.currentVenue || 'unknown',
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
        venueId: user.currentVenue || 'unknown',
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
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <img 
        src={user.photos?.[0]} 
        alt={user.name} 
        className="w-full aspect-square object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
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
