import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Users, MessageCircle, Heart, MapPin, Calendar, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrivateLayout from '@/components/PrivateLayout';
import { logError } from '@/utils/errorHandler';

interface UsageStats {
  totalMatches: number;
  totalMessages: number;
  totalLikes: number;
  totalCheckins: number;
  activeDays: number;
  averageResponseTime: number;
  matchRate: number;
  messageResponseRate: number;
}

interface DailyStats {
  date: string;
  matches: number;
  messages: number;
  likes: number;
  checkins: number;
}

interface VenueStats {
  venueName: string;
  checkins: number;
  matches: number;
  successRate: number;
}

const UsageStats: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [venueStats, setVenueStats] = useState<VenueStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadUsageStats();
  }, [timeRange]);

  const loadUsageStats = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - in real app, fetch from API
      const mockStats: UsageStats = {
        totalMatches: 47,
        totalMessages: 234,
        totalLikes: 156,
        totalCheckins: 23,
        activeDays: 18,
        averageResponseTime: 2.3,
        matchRate: 0.68,
        messageResponseRate: 0.85
      };
      
      setStats(mockStats);

      // Mock daily stats
      const mockDailyStats: DailyStats[] = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        matches: Math.floor(Math.random() * 5) + 1,
        messages: Math.floor(Math.random() * 20) + 5,
        likes: Math.floor(Math.random() * 10) + 1,
        checkins: Math.floor(Math.random() * 3)
      }));
      
      setDailyStats(mockDailyStats);

      // Mock venue stats
      const mockVenueStats: VenueStats[] = [
        { venueName: "Downtown Coffee Shop", checkins: 8, matches: 5, successRate: 0.63 },
        { venueName: "Central Park", checkins: 6, matches: 4, successRate: 0.67 },
        { venueName: "Tech Meetup", checkins: 4, matches: 3, successRate: 0.75 },
        { venueName: "Local Bar", checkins: 3, matches: 2, successRate: 0.67 },
        { venueName: "Gym", checkins: 2, matches: 1, successRate: 0.5 }
      ];
      
      setVenueStats(mockVenueStats);

    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to load usage stats'), { source: 'UsageStats' });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes.toFixed(1)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toFixed(0)}m`;
  };

  if (isLoading) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="max-w-6xl mx-auto p-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  if (!stats) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="max-w-6xl mx-auto p-4">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
              <p className="text-gray-600">Start using the app to see your usage statistics</p>
            </div>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-6xl mx-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage Statistics</h1>
            <p className="text-gray-600">Track your activity and engagement on Mingle</p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6">
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}>
              <TabsList>
                <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
                <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
                <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Matches</p>
                    <p className="text-2xl font-bold">{stats.totalMatches}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center">
                  {getTrendIcon(stats.totalMatches, 42)}
                  <span className="text-sm text-gray-600 ml-1">+12% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                    <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2 flex items-center">
                  {getTrendIcon(stats.totalMessages, 198)}
                  <span className="text-sm text-gray-600 ml-1">+18% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Likes Given</p>
                    <p className="text-2xl font-bold">{stats.totalLikes}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
                <div className="mt-2 flex items-center">
                  {getTrendIcon(stats.totalLikes, 134)}
                  <span className="text-sm text-gray-600 ml-1">+16% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Venue Check-ins</p>
                    <p className="text-2xl font-bold">{stats.totalCheckins}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2 flex items-center">
                  {getTrendIcon(stats.totalCheckins, 19)}
                  <span className="text-sm text-gray-600 ml-1">+21% from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="venues">Venues</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Match Rate</span>
                        <span className="text-sm text-gray-600">{formatPercentage(stats.matchRate)}</span>
                      </div>
                      <Progress value={stats.matchRate * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Message Response Rate</span>
                        <span className="text-sm text-gray-600">{formatPercentage(stats.messageResponseRate)}</span>
                      </div>
                      <Progress value={stats.messageResponseRate * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Active Days</span>
                        <span className="text-sm text-gray-600">{stats.activeDays} days</span>
                      </div>
                      <Progress value={(stats.activeDays / 30) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Response Times */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Response Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{formatTime(stats.averageResponseTime)}</p>
                        <p className="text-sm text-gray-600">Average Response Time</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold">1.2m</p>
                          <p className="text-xs text-gray-600">Fastest Response</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">4.8m</p>
                          <p className="text-xs text-gray-600">Slowest Response</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dailyStats.slice(-7).map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium w-20">{day.date}</span>
                          <div className="flex space-x-4">
                            <span className="text-xs text-gray-600">Matches: {day.matches}</span>
                            <span className="text-xs text-gray-600">Messages: {day.messages}</span>
                            <span className="text-xs text-gray-600">Likes: {day.likes}</span>
                            <span className="text-xs text-gray-600">Check-ins: {day.checkins}</span>
                          </div>
                        </div>
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(day.matches + day.messages + day.likes) / 30 * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="venues" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Venue Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venueStats.map((venue, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{venue.venueName}</h3>
                          <div className="flex space-x-4 mt-1">
                            <span className="text-sm text-gray-600">Check-ins: {venue.checkins}</span>
                            <span className="text-sm text-gray-600">Matches: {venue.matches}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatPercentage(venue.successRate)}</p>
                          <p className="text-sm text-gray-600">Success Rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default UsageStats; 