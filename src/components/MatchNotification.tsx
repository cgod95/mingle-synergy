
import React, { useState, useEffect } from 'react';
import { Match, User } from '@/types';
import { users } from '@/data/mockData';
import { Heart, Clock, Share2, X, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface MatchNotificationProps {
  match: Match;
  currentUserId: string;
  onClose: () => void;
  onShareContact?: () => void;
}

const MatchNotification: React.FC<MatchNotificationProps> = ({ 
  match, 
  currentUserId,
  onClose,
  onShareContact
}) => {
  const [showShareOption, setShowShareOption] = useState(false);
  const [animate, setAnimate] = useState(true);
  
  const matchedUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
  const matchedUser = users.find(user => user.id === matchedUserId) as User;
  
  useEffect(() => {
    // Reset animation after mount for effects to work properly
    const timer = setTimeout(() => {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!matchedUser) return null;
  
  // Calculate time remaining
  const timeRemaining = Math.max(0, match.expiresAt - Date.now());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  const handleShareContact = () => {
    if (onShareContact) {
      onShareContact();
    }
    setShowShareOption(false);
  };
  
  return (
    <div className="match-notification">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-lg" onClick={onClose}></div>
      
      {/* Celebration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {animate && Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: i % 3 === 0 ? '#3A86FF' : i % 3 === 1 ? '#FF5A5F' : '#FFD700',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random(),
              transform: `scale(${Math.random() * 2 + 0.5})`,
              boxShadow: `0 0 6px ${i % 3 === 0 ? '#3A86FF' : i % 3 === 1 ? '#FF5A5F' : '#FFD700'}`,
              animation: `float ${Math.random() * 3 + 2}s linear infinite, 
                        fadeIn ${Math.random() * 2 + 1}s ease-out forwards`,
            }}
          />
        ))}
      </div>
      
      <div className="relative w-full max-w-md rounded-[24px] bg-card shadow-[0_10px_50px_rgba(0,0,0,0.15)] border border-border/50 overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#3A86FF]/30 to-transparent"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-background/70 z-10"
        >
          <X size={18} />
        </button>
        
        <div className="relative p-8 pt-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3A86FF] to-[#FF5A5F]/70 shadow-[0_0_30px_rgba(255,90,95,0.3)] backdrop-blur-sm flex items-center justify-center mb-6 animate-pulse">
            <Heart className="text-white w-10 h-10 fill-white animate-heart-beat" />
          </div>
          
          <div className="absolute top-14 right-1/2 transform translate-x-1/2 translate-y-1/2">
            <Sparkles className="text-yellow-400 w-6 h-6 animate-pulse-once" />
          </div>
          
          <h2 className="heading-large mb-2 text-center">You matched with {matchedUser.name}!</h2>
          
          <p className="text-center text-muted-foreground mb-8 max-w-xs body-text">
            You and {matchedUser.name} have expressed interest in each other.
          </p>
          
          {/* User photos side by side */}
          <div className="flex justify-center items-center mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-[0_0_20px_rgba(58,134,255,0.2)] -mr-3">
              <img 
                src={users.find(u => u.id === currentUserId)?.photos[0] || ''} 
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-[0_0_20px_rgba(58,134,255,0.2)] -ml-3">
              <img 
                src={matchedUser.photos[0]} 
                alt={matchedUser.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-1">{matchedUser.name}</h3>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Clock size={16} />
            <span>Expires in {hoursRemaining}h {minutesRemaining}m</span>
          </div>
          
          {showShareOption ? (
            <div className="w-full space-y-5">
              <p className="text-center text-sm text-muted-foreground">
                Share your contact details with {matchedUser.name}?
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowShareOption(false)}
                  className="py-6 rounded-full"
                >
                  Not now
                </Button>
                
                <Button
                  onClick={handleShareContact}
                  className="bg-gradient-to-r from-[#3A86FF] to-[#4A94FF] text-white shadow-button hover:shadow-none py-6 rounded-full"
                >
                  Share <Share2 className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button
                variant="outline"
                onClick={onClose}
                className="py-6 rounded-full"
              >
                Keep Browsing
              </Button>
              
              <Button
                onClick={() => setShowShareOption(true)}
                className="bg-gradient-to-r from-[#3A86FF] to-[#4A94FF] text-white shadow-button hover:shadow-none py-6 rounded-full"
              >
                Send a Message
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchNotification;
