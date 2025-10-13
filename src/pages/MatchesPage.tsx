/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListSkeleton } from '@/components/ui/skeleton';
import { UserProfile } from '@/types/services';
import { Heart, MessageCircle, Clock, MapPin, AlertCircle, Users, Sparkles, Star, Zap } from 'lucide-react';
import logger from '@/utils/Logger';
import matchService from '@/services/firebase/matchService';
import userService from '@/services/firebase/userService';
import { useAuth } from '@/context/AuthContext';

interface MatchWithUser {
  id: string;
  userId1: string;
  userId2: string;
  venueId: string;
  timestamp: number;
  matchedAt: number;
  messages: {
    senderId: string;
    text: string;
    timestamp: number;
  }[];
  otherUser: UserProfile | null;
  timeRemaining: string;
  isExpired: boolean;
  compatibility: number;
  sharedInterests: string[];
}

export default function MatchesPage() {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<MatchWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe: (() => void) | undefined;

    const setupListener = () => {
      try {
        setLoading(true);
        setError(null);

        unsubscribe = matchService.getMatchesWithListener(currentUser.uid, async (firebaseMatches) => {
          const matchesWithUsers = await Promise.all(
            firebaseMatches.map(async (match) => {
              const otherUserId = match.userId1 === currentUser.uid ? match.userId2 : match.userId1;
              const otherUser = await userService.getUserProfile(otherUserId);
              
              const now = Date.now();
              const timeLeft = (match.timestamp + (3 * 60 * 60 * 1000)) - now;
              const isExpired = timeLeft <= 0;
              
              const timeRemaining = isExpired 
                ? 'Expired' 
                : formatTimeRemaining(match.timestamp + (3 * 60 * 60 * 1000));

              // Mock compatibility and shared interests
              const compatibility = Math.floor(70 + Math.random() * 30);
              const sharedInterests = ['Coffee', 'Music', 'Travel'].slice(0, Math.floor(Math.random() * 3) + 1);

              return {
                id: match.id,
                userId1: (match as any).userId1 ?? match.userId1 ?? (match as any).userId1,
                userId2: (match as any).userId2 ?? match.userId2 ?? (match as any).userId2,
                venueId: match.venueId,
                timestamp: match.timestamp,
                matchedAt: match.matchedAt,
                messages: match.messages,
                otherUser: otherUser,
                timeRemaining,
                isExpired,
                compatibility,
                sharedInterests
              };
            })
          );

          setMatches(matchesWithUsers);
          setLoading(false);
        });
      } catch (err) {
        logger.error('Error loading matches:', err);
        setError('Failed to load matches');
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 text-lg">Your connections</p>
        </div>
        <ListSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Something went wrong</h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-500 to-purple-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 text-lg">Your connections</p>
        </div>
        
        <Card className="text-center py-20">
          <CardContent className="pt-6">
            <div className="space-y-8">
              <div className="relative">
                <Heart className="w-24 h-24 text-gray-300 mx-auto" />
                <Sparkles className="w-8 h-8 text-blue-500 absolute -top-3 -right-10 animate-pulse" />
                <Sparkles className="w-6 h-6 text-purple-500 absolute -bottom-3 -left-8 animate-pulse delay-1000" />
                <Sparkles className="w-4 h-4 text-pink-500 absolute top-8 -left-4 animate-pulse delay-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900">No matches yet</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-lg">
                  Check into a venue and start liking people to make matches! 
                  Your matches will appear here once you connect with someone.
                </p>
              </div>
              <Link to="/venues">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-3 rounded-full">
                  <MapPin className="w-5 h-5 mr-3" />
                  Browse Venues
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">Matches</h1>
        <p className="text-gray-600 text-lg">Your connections</p>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          // Get last message preview
          const lastMessage = match.messages.length > 0 ? match.messages[match.messages.length - 1].text : null;
          return (
            <Card key={match.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl border-2 border-transparent hover:border-blue-200 bg-white/90 backdrop-blur-md">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <Avatar className="w-20 h-20 ring-4 ring-blue-200 shadow-xl">
                      <AvatarImage 
                        src={match.otherUser?.photos?.[0]} 
                        alt={match.otherUser?.name} 
                        className="object-cover w-full h-full"
                      />
                      <AvatarFallback className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {match.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">{match.otherUser?.name || 'Unknown User'}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1 flex-wrap">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Matched {formatTimeRemaining(match.timestamp + (3 * 60 * 60 * 1000))} ago</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          <span className="font-medium">{match.compatibility}% match</span>
                        </div>
                      </div>
                      {/* Shared Interests */}
                      {match.sharedInterests.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <div className="flex space-x-1 flex-wrap">
                            {match.sharedInterests.map((interest, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3 w-full md:w-auto mt-4 md:mt-0">
                    {match.isExpired ? (
                      <Badge variant="destructive" className="px-3 py-1 text-base md:text-sm">
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1 text-base md:text-sm animate-pulse">
                        <Clock className="w-4 h-4 mr-1" />
                        {match.timeRemaining}
                      </Badge>
                    )}
                    {match.messages.length > 0 && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {match.messages.length} message{match.messages.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Venue {match.venueId}</span>
                  </div>
                  {/* Message preview */}
                  {lastMessage && (
                    <div className="flex-1 text-gray-500 text-xs italic text-center md:text-right truncate max-w-xs md:max-w-sm">
                      <MessageCircle className="inline w-4 h-4 mr-1 text-blue-400" />
                      {lastMessage.length > 60 ? lastMessage.slice(0, 60) + '…' : lastMessage}
                    </div>
                  )}
                  <div className="flex space-x-3 mt-2 md:mt-0">
                    {!match.isExpired && (
                      <Link to={`/chat/${match.id}`}>
                        <Button size="lg" variant="outline" className="rounded-full border-blue-500 text-blue-600 hover:bg-blue-50">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </Link>
                    )}
                    <Link to={`/match/${match.id}`}>
                      <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full">
                        <Heart className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 