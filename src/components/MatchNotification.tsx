
import React from 'react';
import { Match, User } from '@/types';
import { users } from '@/data/mockData';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchNotificationProps {
  match: Match;
  currentUserId: string;
  onClose: () => void;
}

const MatchNotification: React.FC<MatchNotificationProps> = ({ 
  match, 
  currentUserId,
  onClose 
}) => {
  const matchedUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
  const matchedUser = users.find(user => user.id === matchedUserId) as User;
  
  if (!matchedUser) return null;
  
  // Calculate time remaining
  const timeRemaining = Math.max(0, match.expiresAt - Date.now());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md rounded-2xl bg-card shadow-lg border border-border overflow-hidden animate-scale-in">
        <div className="absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-primary/20 to-transparent"></div>
        
        <div className="relative p-6 pt-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <Heart className="text-primary w-8 h-8 fill-primary" />
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
          
          {matchedUser.interests && matchedUser.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {matchedUser.interests.map((interest, idx) => (
                <span 
                  key={idx} 
                  className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-sm text-muted-foreground mb-6">
            This match expires in {hoursRemaining}h {minutesRemaining}m
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Later
            </button>
            
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Say Hello
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchNotification;
