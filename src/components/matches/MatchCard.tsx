
import React, { useState } from 'react';
import { Match, User } from '@/types';
import { trackContactShared } from '@/services/appAnalytics';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Coffee } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDivider } from '@/components/ui/card';

interface MatchCardProps {
  match: Match;
  user: User;
  onReconnectRequest: (matchId: string) => Promise<boolean>;
  onShareContact: (matchId: string) => Promise<boolean>;
  onWeMetClick: (matchId: string) => Promise<boolean>;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  user, 
  onReconnectRequest,
  onShareContact,
  onWeMetClick
}) => {
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [isReconnectLoading, setIsReconnectLoading] = useState(false);
  const [isWeMetLoading, setIsWeMetLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  
  const isExpired = Date.now() > match.expiresAt;
  const isWithinReconnectWindow = isExpired && (Date.now() - match.expiresAt) < (6 * 60 * 60 * 1000); // 6 hours
  
  const getTimeRemaining = () => {
    if (isExpired) return 'Expired';
    
    const remaining = match.expiresAt - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  const handleShareContact = async () => {
    if (isShareLoading) return;
    
    setIsShareLoading(true);
    try {
      const success = await onShareContact(match.id);
      if (success) {
        trackContactShared(match.id);
      }
    } catch (error) {
      console.error('Error sharing contact:', error);
    } finally {
      setIsShareLoading(false);
    }
  };
  
  const handleReconnectRequest = async () => {
    if (isReconnectLoading) return;
    
    setIsReconnectLoading(true);
    try {
      await onReconnectRequest(match.id);
    } catch (error) {
      console.error('Error requesting reconnect:', error);
    } finally {
      setIsReconnectLoading(false);
    }
  };
  
  const handleWeMetClick = async () => {
    if (isWeMetLoading) return;
    
    setIsWeMetLoading(true);
    try {
      await onWeMetClick(match.id);
    } catch (error) {
      console.error('Error marking as met:', error);
    } finally {
      setIsWeMetLoading(false);
    }
  };
  
  const getVenueName = () => {
    if (match.venueId?.includes('-')) {
      return match.venueId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return 'a venue';
  };
  
  const handleAddComment = () => {
    setShowCommentInput(!showCommentInput);
  };
  
  const handleSubmitComment = () => {
    // In a real app, this would send the comment to the backend
    setComment('');
    setShowCommentInput(false);
  };
  
  // Mock prompt data (in a real app, these would come from the user profile)
  const prompts = [
    {
      question: "The way to my heart is",
      answer: "Good food and interesting conversation"
    },
    {
      question: "A life goal of mine",
      answer: "To visit every continent at least once"
    }
  ];
  
  // Randomly select one prompt to display
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  
  return (
    <Card className="mb-4 animate-scale-in overflow-hidden">
      <div className="relative">
        <OptimizedImage
          src={user.photos[0]}
          alt={user.name}
          className="w-full h-[350px] object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-2xl font-semibold">{user.name}</h3>
          <p className="text-white/80 text-sm">
            Matched at {getVenueName()}
          </p>
        </div>
        
        {!isExpired && !match.contactShared && (
          <button 
            onClick={handleAddComment}
            className="absolute top-4 right-4 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition-colors"
            aria-label="Add comment"
          >
            <MessageSquare size={20} className="text-[#F3643E]" />
          </button>
        )}
      </div>
      
      {showCommentInput && (
        <div className="p-3 bg-[#F9F9F9]">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Say something about their photo..."
            className="w-full p-3 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-1 focus:ring-[#F3643E]"
            rows={2}
          />
          <div className="flex justify-end mt-2 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommentInput(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!comment.trim()}
            >
              Send
            </Button>
          </div>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="border border-[#F3643E]/10 rounded-lg p-3 mb-4 bg-[#F3643E]/5">
          <p className="text-sm text-[#7B8794] font-medium mb-1">{randomPrompt.question}</p>
          <p className="text-[#212832]">{randomPrompt.answer}</p>
        </div>
        
        {match.contactShared ? (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-700 text-sm font-medium flex items-center">
              <Coffee size={16} className="mr-2" />
              Contact info shared! Meet them at the venue.
            </p>
          </div>
        ) : isExpired ? (
          isWithinReconnectWindow ? (
            <Button
              onClick={handleReconnectRequest}
              disabled={isReconnectLoading}
              variant="outline"
              className="w-full"
            >
              {isReconnectLoading ? 'Requesting...' : 'Request Reconnect'}
            </Button>
          ) : (
            <p className="text-[#7B8794] text-sm text-center py-2">
              This match has expired
            </p>
          )
        ) : (
          <Button
            onClick={handleShareContact}
            disabled={isShareLoading}
            className="w-full"
          >
            <Share2 size={18} className="mr-2" />
            {isShareLoading ? 'Sharing...' : 'Share Contact'}
          </Button>
        )}
      </CardContent>
      
      <CardDivider />
      
      {!isExpired && (
        <CardFooter className="justify-center">
          <Button
            onClick={handleWeMetClick}
            disabled={isWeMetLoading}
            variant="premium"
            className="w-full"
          >
            <Heart size={18} className="mr-2" />
            {isWeMetLoading ? 'Saving...' : 'We Met'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MatchCard;
