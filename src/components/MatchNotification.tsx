
import React, { useState } from 'react';
import { Match, User } from '@/types';
import { users } from '@/data/mockData';
import { Heart, Clock, Share2, X } from 'lucide-react';
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
  
  const matchedUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
  const matchedUser = users.find(user => user.id === matchedUserId) as User;
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md rounded-2xl bg-card shadow-lg border border-border overflow-hidden animate-scale-in">
        <div className="absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-[#3A86FF]/20 to-transparent"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/50 flex items-center justify-center"
        >
          <X size={18} />
        </button>
        
        <div className="relative p-6 pt-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#3A86FF]/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <Heart className="text-[#3A86FF] w-8 h-8 fill-[#3A86FF]" />
          </div>
          
          <h2 className="text-2xl font-semibold text-foreground mb-2">It's a Match!</h2>
          <p className="text-center text-muted-foreground mb-6">
            You and {matchedUser.name} have expressed interest in each other.
          </p>
          
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background mb-4">
            <img 
              src={matchedUser.photos[0] + "?auto=format&fit=crop&w=200&q=80"} 
              alt={matchedUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h3 className="text-xl font-medium text-foreground mb-1">{matchedUser.name}</h3>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Clock size={16} />
            <span>This match expires in {hoursRemaining}h {minutesRemaining}m</span>
          </div>
          
          {showShareOption ? (
            <div className="w-full space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Share your contact details with {matchedUser.name}?
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowShareOption(false)}
                >
                  Not now
                </Button>
                
                <Button
                  onClick={handleShareContact}
                  className="bg-[#3A86FF] hover:bg-[#3A86FF]/90"
                >
                  Share <Share2 className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Later
              </Button>
              
              <Button
                onClick={() => setShowShareOption(true)}
                className="bg-[#3A86FF] hover:bg-[#3A86FF]/90"
              >
                Share Contact
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchNotification;
