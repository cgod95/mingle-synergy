import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  MessageCircle, 
  Zap,
  Coffee,
  Music,
  Dumbbell,
  Palette,
  BookOpen,
  TrendingUp,
  Activity,
  Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { mockVenues } from '@/data/mock';
import { mockUsers } from '@/data/mock';
import { notificationService } from '@/services/notificationService';
import CheckInButton from '@/components/CheckInButton';
import VenueUserGrid from '@/components/venue/VenueUserGrid';
import VenueDetails from '@/components/venue/VenueDetails';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';

interface VenueActivity {
  id: string;
  type: 'checkin' | 'match' | 'message' | 'like';
  description: string;
  timestamp: number;
  userCount?: number;
}

export default function ActiveVenue() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [venue, setVenue] = useState(mockVenues.find(v => v.id === venueId));
  const [venueActivity, setVenueActivity] = useState<VenueActivity[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const simulateVenueActivity = useCallback(() => {
    const activityTypes: VenueActivity['type'][] = ['checkin', 'match', 'message', 'like'];
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    let description = '';
    switch (type) {
      case 'checkin':
        description = 'Someone new checked in';
        break;
      case 'match':
        description = 'A new match was made here';
        break;
      case 'message':
        description = 'Messages were exchanged';
        break;
      case 'like':
        description = 'Someone liked a profile';
        break;
    }

    const newActivity: VenueActivity = {
      id: `activity_${Date.now()}`,
      type,
      description,
      timestamp: Date.now(),
      userCount: Math.floor(Math.random() * 3) + 1
    };

    setVenueActivity(prev => [newActivity, ...prev.slice(0, 9)]);

    // Send venue activity notification
    notificationService.notifyVenueActivity({
      venueName: venue?.name || '',
      venueId: venueId || '',
      activity: description
    });
  }, [venue?.name, venueId]);

  useEffect(() => {
    if (!venueId || !venue) {
      navigate('/venues');
      return;
    }

    // Check if user is already checked in
    const userCheckIns = JSON.parse(localStorage.getItem(`checkIns_${currentUser?.uid}`) || '[]');
    const isUserCheckedIn = userCheckIns.some((ci: { venueName: string; expiresAt: number }) => 
      ci.venueName === venue.name && ci.expiresAt && Date.now() < ci.expiresAt
    );
    setIsCheckedIn(isUserCheckedIn);

    // Generate venue activity
    generateVenueActivity();

    // Set up real-time activity simulation
    const activityInterval = setInterval(() => {
      simulateVenueActivity();
    }, 30000); // Every 30 seconds

    return () => clearInterval(activityInterval);
  }, [venueId, venue, currentUser?.uid, navigate, simulateVenueActivity]);

  const generateVenueActivity = () => {
    const activities: VenueActivity[] = [];
    const now = Date.now();
    
    // Generate recent activity
    for (let i = 0; i < 10; i++) {
      const activityTypes: VenueActivity['type'][] = ['checkin', 'match', 'message', 'like'];
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      
      let description = '';
      switch (type) {
        case 'checkin':
          description = 'Someone new checked in';
          break;
        case 'match':
          description = 'A new match was made here';
          break;
        case 'message':
          description = 'Messages were exchanged';
          break;
        case 'like':
          description = 'Someone liked a profile';
          break;
      }

      activities.push({
        id: `activity_${i}`,
        type,
        description,
        timestamp: now - (Math.random() * 3600000), // Last hour
        userCount: Math.floor(Math.random() * 5) + 1
      });
    }

    setVenueActivity(activities.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    
    // Send check-in notification
    const peopleCount = mockUsers.filter(u => 
      u.currentVenue === venueId && u.isCheckedIn
    ).length;

    notificationService.notifyVenueCheckIn({
      venueName: venue?.name || '',
      venueId: venueId || '',
      peopleCount
    });
  };

  const getVenueIcon = (venueType: string) => {
    switch (venueType.toLowerCase()) {
      case 'cafe':
      case 'coffee shop':
        return <Coffee className="w-6 h-6" />;
      case 'bar':
      case 'pub':
      case 'club':
        return <Music className="w-6 h-6" />;
      case 'gym':
      case 'fitness':
        return <Dumbbell className="w-6 h-6" />;
      case 'gallery':
      case 'museum':
        return <Palette className="w-6 h-6" />;
      case 'library':
      case 'bookstore':
        return <BookOpen className="w-6 h-6" />;
      default:
        return <MapPin className="w-6 h-6" />;
    }
  };

  const getActivityIcon = (type: VenueActivity['type']) => {
    switch (type) {
      case 'checkin':
        return <MapPin className="w-4 h-4 text-green-500" />;
      case 'match':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-pink-500" />;
    }
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

  if (!venue) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Venue not found</p>
        </div>
        <BottomNav />
      </Layout>
    );
  }

  const peopleAtVenue = mockUsers.filter(u => 
    u.currentVenue === venueId && u.isCheckedIn
  ).length;

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        {/* Venue Header */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getVenueIcon(venue.type)}
                </div>
                <div>
                  <CardTitle className="text-xl">{venue.name}</CardTitle>
                  <p className="text-sm text-gray-600">{venue.address}</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="mr-2">
                      {venue.type}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {peopleAtVenue} people here
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  Popular venue
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  Active today
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Check-in Section */}
        <CheckInButton 
          venueId={venueId!}
          venueName={venue.name}
          onCheckIn={handleCheckIn}
          className="mb-6"
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <VenueDetails 
              venue={{
                ...venue,
                userCount: peopleAtVenue
              }}
              expiryTime="12 hours"
              onCheckOut={() => {
                // Handle check out logic
                toast({
                  title: "Checked out",
                  description: "You're no longer visible at this venue",
                });
              }}
            />
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Venue Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{peopleAtVenue}</div>
                    <div className="text-sm text-blue-600">People here</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.floor(Math.random() * 20) + 5}
                    </div>
                    <div className="text-sm text-green-600">Matches today</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="people" className="space-y-4">
            <VenueUserGrid 
              venueId={venueId!}
              venueName={venue.name}
              onUserLike={(userId) => {
                toast({
                  title: "Like sent! ❤️",
                  description: "They'll be notified of your interest",
                });
              }}
              onUserView={(userId) => {
                navigate(`/profile/${userId}`);
              }}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Live Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {venueActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {getTimeAgo(activity.timestamp)}
                          {activity.userCount && ` • ${activity.userCount} people involved`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </Layout>
  );
}