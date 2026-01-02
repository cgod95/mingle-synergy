import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  Clock, 
  Heart, 
  MessageCircle, 
  Eye, 
  Zap,
  Coffee,
  Music,
  Dumbbell,
  Palette,
  BookOpen,
  Sparkles,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockUsers } from '@/data/mock';
import { mockVenues } from '@/data/mock';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/components/ui/use-toast';
import { matchService } from '@/services';
import config from '@/config';
import { logError } from '@/utils/errorHandler';
import { triggerNewMatchNotification } from '@/hooks/useNewMatchNotification';

interface VenueUserGridProps {
  venueId: string;
  venueName: string;
  onUserLike?: (userId: string) => void;
  onUserView?: (userId: string) => void;
}

interface VenueUser {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  interests: string[];
  checkInTime: number;
  isCheckedIn: boolean;
  lastActive: number;
  mutualInterests?: string[];
  distance?: number; // in meters
  zone?: string; // venue zone/section
}

const getVenueIcon = (venueType: string) => {
  switch (venueType.toLowerCase()) {
    case 'cafe':
    case 'coffee shop':
      return <Coffee className="w-4 h-4" />;
    case 'bar':
    case 'pub':
    case 'club':
      return <Music className="w-4 h-4" />;
    case 'gym':
    case 'fitness':
      return <Dumbbell className="w-4 h-4" />;
    case 'gallery':
    case 'museum':
      return <Palette className="w-4 h-4" />;
    case 'library':
    case 'bookstore':
      return <BookOpen className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

const getZoneColor = (zone: string) => {
  switch (zone.toLowerCase()) {
    case 'bar area':
      return 'bg-blue-100 text-blue-800';
    case 'dance floor':
      return 'bg-purple-100 text-purple-800';
    case 'outdoor':
      return 'bg-green-100 text-green-800';
    case 'quiet area':
      return 'bg-gray-100 text-gray-800';
    case 'coffee bar':
      return 'bg-amber-100 text-amber-800';
    case 'weights':
      return 'bg-red-100 text-red-800';
    case 'cardio':
      return 'bg-orange-100 text-orange-800';
    case 'yoga':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Waiting Room UI Component - shown when no other users are checked in
function WaitingRoomUI({ venueName }: { venueName: string }) {
  const [dots, setDots] = useState('');
  const [checkInCount, setCheckInCount] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  // Animate the waiting dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Simulate occasional "someone just checked in" moments (for demo only)
  useEffect(() => {
    // Random pulse animation every 15-30 seconds to show activity
    const pulseInterval = setInterval(() => {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    }, Math.random() * 15000 + 15000);

    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className="text-center py-12 px-6">
      {/* Animated Icon */}
      <div className={`relative inline-block mb-6 ${showPulse ? 'animate-pulse' : ''}`}>
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
          <Users className="w-12 h-12 text-indigo-500" />
        </div>
        {/* Sparkle decoration */}
        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
      </div>

      {/* Main Message */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        You're the first one here! 🎉
      </h3>
      <p className="text-gray-600 mb-4">
        Be the trendsetter at {venueName}
      </p>

      {/* Waiting Animation */}
      <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full mb-6">
        <Bell className="w-4 h-4" />
        <span className="text-sm font-medium">
          Waiting for others to check in{dots}
        </span>
      </div>

      {/* Live Counter Section */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-indigo-100">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {checkInCount}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              People Today
            </div>
          </div>
          <div className="h-12 w-px bg-gray-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              1
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              That's You!
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700">While you wait:</p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-xs">✨</span>
            Make sure your profile is complete
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-xs">📸</span>
            Add a great photo if you haven't
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center text-xs">💬</span>
            We'll notify you when someone arrives
          </li>
        </ul>
      </div>

      {/* Encouragement */}
      <p className="text-xs text-gray-400 mt-6">
        Venues get busier throughout the evening — stick around! 
      </p>
    </div>
  );
}

export default function VenueUserGrid({ venueId, venueName, onUserLike, onUserView }: VenueUserGridProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [venueUsers, setVenueUsers] = useState<VenueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'nearby'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'mutual' | 'distance'>('recent');
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [isLiking, setIsLiking] = useState<string | null>(null);

  // Get venue details
  const venue = mockVenues.find(v => v.id === venueId);
  const venueType = venue?.type || 'venue';

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Get users checked in to this venue
    // PHOTO FILTER: Only show users with at least 1 photo
    const usersAtVenue = mockUsers.filter(user => 
      user.currentVenue === venueId && 
      user.isCheckedIn && 
      user.id !== currentUser.uid &&
      user.photos && user.photos.length > 0 // Must have at least 1 photo
    );

    // Enhance user data with venue-specific information
    const enhancedUsers: VenueUser[] = usersAtVenue.map(user => {
      const currentUserData = mockUsers.find(u => u.id === currentUser.uid);
      const mutualInterests = currentUserData?.interests?.filter(interest => 
        user.interests?.includes(interest)
      ) || [];

      // Simulate distance and zone data
      const distance = Math.floor(Math.random() * 50) + 1; // 1-50 meters
      const zones = ['Bar Area', 'Dance Floor', 'Outdoor', 'Quiet Area', 'Coffee Bar', 'Weights', 'Cardio', 'Yoga'];
      const zone = zones[Math.floor(Math.random() * zones.length)];

      return {
        id: user.id,
        name: user.name || 'Unknown',
        age: user.age || 25,
        photos: user.photos || [],
        bio: user.bio || '',
        interests: user.interests || [],
        checkInTime: user.lastActive || Date.now(),
        isCheckedIn: user.isCheckedIn,
        lastActive: user.lastActive || Date.now(),
        mutualInterests,
        distance,
        zone
      };
    });

    setVenueUsers(enhancedUsers);
    setLoading(false);

    // Notify about new people if there are users
    if (enhancedUsers.length > 0) {
      notificationService.notifyProximityAlert({
        venueName,
        venueId,
        newPeopleCount: enhancedUsers.length
      });
    }
  }, [venueId, currentUser?.uid, venueName]);

  const handleLike = async (userId: string) => {
    const user = venueUsers.find(u => u.id === userId);
    if (!user || !currentUser?.uid || isLiking === userId) return;
    
    // Prevent double-liking
    if (likedUserIds.has(userId)) {
      toast({
        title: "Already liked",
        description: `You've already liked ${user.name}`,
      });
      return;
    }
    
    setIsLiking(userId);
    
    try {
      let isMatch = false;
      
      if (!config.DEMO_MODE) {
        // Production: Use real matchService
        const result = await matchService.likeUser(currentUser.uid, userId, venueId);
        isMatch = result.isMatch;
      } else {
        // Demo mode: Use localStorage-based mock
        const mockMatchService = (await import('@/services/mock/mockMatchService')).default;
        const result = await mockMatchService.likeUser(currentUser.uid, userId, venueId);
        isMatch = result.isMatch;
      }
      
      setLikedUserIds(prev => new Set([...prev, userId]));
      
      if (isMatch) {
        // Trigger in-app match popup
        triggerNewMatchNotification({
          matchId: `match_${Date.now()}`,
          partnerName: user.name,
          partnerPhoto: user.photos?.[0],
          venueName
        });
        
        // Send match notification (for background/push)
        notificationService.notifyNewMatch({
          userId: currentUser.uid,
          matchId: `match_${Date.now()}`,
          otherUserId: user.id
        });
      } else {
        toast({
          title: "Like sent! ❤️",
          description: `${user.name} will be notified of your interest`,
        });
      }
      
      onUserLike?.(userId);
    } catch (error) {
      logError(error as Error, { source: 'VenueUserGrid', action: 'handleLike', userId, venueId });
      toast({
        title: "Couldn't send like",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLiking(null);
    }
  };

  const handleViewProfile = (userId: string) => {
    onUserView?.(userId);
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = [...venueUsers];

    // Apply filters
    switch (filter) {
      case 'recent': {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        filtered = filtered.filter(user => user.checkInTime > oneHourAgo);
        break;
      }
      case 'nearby': {
        filtered = filtered.filter(user => (user.distance || 0) <= 20);
        break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.checkInTime - a.checkInTime);
        break;
      case 'mutual':
        filtered.sort((a, b) => (b.mutualInterests?.length || 0) - (a.mutualInterests?.length || 0));
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
    }

    return filtered;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return 'Today';
  };

  const filteredUsers = getFilteredAndSortedUsers();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {getVenueIcon(venueType)}
            <span className="ml-2">People at {venueName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Loading people nearby...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {getVenueIcon(venueType)}
            <span className="ml-2">People at {venueName}</span>
            <Badge variant="secondary" className="ml-2">
              {filteredUsers.length}
            </Badge>
          </div>
        </CardTitle>
        
        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex gap-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('recent')}
            >
              Recent
            </Button>
            <Button
              variant={filter === 'nearby' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('nearby')}
            >
              Nearby
            </Button>
          </div>
          
          <div className="flex gap-1 ml-auto">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
            >
              Recent
            </Button>
            <Button
              variant={sortBy === 'mutual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('mutual')}
            >
              Mutual
            </Button>
            <Button
              variant={sortBy === 'distance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('distance')}
            >
              Distance
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredUsers.length === 0 ? (
          <WaitingRoomUI venueName={venueName} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.photos[0]} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">{user.name}, {user.age}</h3>
                        <Badge variant="outline" className="text-xs">
                          {user.distance}m away
                        </Badge>
                      </div>
                      
                      {user.zone && (
                        <Badge className={`text-xs ${getZoneColor(user.zone)} mb-2`}>
                          {user.zone}
                        </Badge>
                      )}
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{user.bio}</p>
                      
                      {user.mutualInterests && user.mutualInterests.length > 0 && (
                        <div className="flex items-center text-xs text-blue-600 mb-2">
                          <Heart className="w-3 h-3 mr-1" />
                          {user.mutualInterests.length} mutual interests
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Clock className="w-3 h-3 mr-1" />
                        {getTimeAgo(user.checkInTime)}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProfile(user.id)}
                          className="flex-1"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleLike(user.id)}
                          className={`flex-1 ${likedUserIds.has(user.id) ? 'bg-red-500 hover:bg-red-500 text-white' : ''}`}
                          disabled={isLiking === user.id || likedUserIds.has(user.id)}
                        >
                          <Heart className={`w-3 h-3 mr-1 ${likedUserIds.has(user.id) ? 'fill-white' : ''}`} />
                          {likedUserIds.has(user.id) ? 'Liked' : 'Like'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 