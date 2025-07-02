import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockUsers } from '@/data/mock';
import { mockVenues } from '@/data/mock';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/components/ui/use-toast';

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

export default function VenueUserGrid({ venueId, venueName, onUserLike, onUserView }: VenueUserGridProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [venueUsers, setVenueUsers] = useState<VenueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'nearby'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'mutual' | 'distance'>('recent');

  // Get venue details
  const venue = mockVenues.find(v => v.id === venueId);
  const venueType = venue?.type || 'venue';

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Get users checked in to this venue
    const usersAtVenue = mockUsers.filter(user => 
      user.currentVenue === venueId && 
      user.isCheckedIn && 
      user.id !== currentUser.uid
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
        name: user.name,
        age: user.age,
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

  const handleLike = (userId: string) => {
    const user = venueUsers.find(u => u.id === userId);
    if (!user) return;

    // Check if it's a mutual like (match)
    const isMatch = Math.random() < 0.3; // 30% chance for demo

    if (isMatch) {
      toast({
        title: "It's a match! 💕",
        description: `You and ${user.name} liked each other at ${venueName}!`,
      });

      // Send match notification
      notificationService.notifyNewMatch({
        matchId: `match_${Date.now()}`,
        userName: user.name,
        venueName
      });
    } else {
      toast({
        title: "Like sent! ❤️",
        description: `${user.name} will be notified of your interest`,
      });
    }

    onUserLike?.(userId);
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
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No one else is checked in right now</p>
            <p className="text-sm">Check back later or try another venue</p>
          </div>
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
                          className="flex-1"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          Like
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