
import React, { useState } from 'react';
import { Match, User } from '@/types';
import { trackContactShared } from '@/services/appAnalytics';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { Button } from "@/components/ui/button";

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
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <OptimizedImage
            src={user.photos[0]}
            alt={user.name}
            className="w-14 h-14 rounded-full"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-sm text-gray-600">
              Matched at {getVenueName()}
            </p>
            {!isExpired && (
              <p className="text-xs text-gray-500">
                Expires in {getTimeRemaining()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col space-y-3">
          {match.contactShared ? (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                Contact info shared! Meet them at the venue.
              </p>
            </div>
          ) : isExpired ? (
            isWithinReconnectWindow ? (
              <Button
                onClick={handleReconnectRequest}
                disabled={isReconnectLoading}
                variant="outline"
                className="w-full py-2 border-blue-500 text-blue-500 font-medium"
              >
                {isReconnectLoading ? 'Requesting...' : 'Request Reconnect'}
              </Button>
            ) : (
              <p className="text-gray-500 text-sm text-center">
                This match has expired
              </p>
            )
          ) : (
            <Button
              onClick={handleShareContact}
              disabled={isShareLoading}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              {isShareLoading ? 'Sharing...' : 'Share Contact'}
            </Button>
          )}
          
          {!isExpired && (
            <Button
              onClick={handleWeMetClick}
              disabled={isWeMetLoading}
              variant="outline"
              className="w-full py-2 border-green-500 text-green-500 hover:bg-green-50 font-medium"
            >
              {isWeMetLoading ? 'Saving...' : 'We Met'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
