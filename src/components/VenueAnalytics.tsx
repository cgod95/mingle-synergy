import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  MapPin,
  Calendar,
  Target,
  Award,
  Activity,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { analytics } from '@/services/analytics';

interface VenueAnalyticsProps {
  venueId: string;
  venueName: string;
  isPartner?: boolean;
}

interface VenueMetrics {
  totalCheckIns: number;
  activeUsers: number;
  matchesCreated: number;
  messagesSent: number;
  averageSessionTime: number;
  peakHours: string[];
  popularZones: Array<{ name: string; count: number }>;
  weeklyTrend: Array<{ day: string; checkIns: number }>;
  conversionRate: number;
  userSatisfaction: number;
}

export default function VenueAnalytics({ venueId, venueName, isPartner = false }: VenueAnalyticsProps) {
  const [metrics, setMetrics] = useState<VenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    // Simulate loading venue analytics
    const loadAnalytics = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockMetrics: VenueMetrics = {
        totalCheckIns: 1247,
        activeUsers: 89,
        matchesCreated: 156,
        messagesSent: 892,
        averageSessionTime: 45, // minutes
        peakHours: ['7-9 PM', '9-11 PM', '5-7 PM'],
        popularZones: [
          { name: 'Bar Area', count: 45 },
          { name: 'Dance Floor', count: 32 },
          { name: 'Outdoor', count: 28 },
          { name: 'Quiet Area', count: 15 }
        ],
        weeklyTrend: [
          { day: 'Mon', checkIns: 45 },
          { day: 'Tue', checkIns: 52 },
          { day: 'Wed', checkIns: 78 },
          { day: 'Thu', checkIns: 95 },
          { day: 'Fri', checkIns: 120 },
          { day: 'Sat', checkIns: 145 },
          { day: 'Sun', checkIns: 89 }
        ],
        conversionRate: 12.5, // percentage
        userSatisfaction: 4.2 // out of 5
      };
      
      setMetrics(mockMetrics);
      setLoading(false);
    };
    
    loadAnalytics();
  }, [venueId, timeRange]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Analytics...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <BarChart3 className="w-6 h-6 mr-2" />
            {venueName} Analytics
            {isPartner && (
              <Badge className="ml-2 bg-purple-100 text-purple-800">
                <Award className="w-3 h-3 mr-1" />
                Partner
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={timeRange === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('day')}
            >
              Today
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              This Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              This Month
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalCheckIns}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Matches Created</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.matchesCreated}</p>
                </div>
                <div className="p-3 bg-pink-100 rounded-full">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.messagesSent}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-green-600">{metrics.conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Satisfaction</span>
              <span className="font-semibold text-blue-600">{metrics.userSatisfaction}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Session Time</span>
              <span className="font-semibold text-purple-600">{metrics.averageSessionTime} min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.peakHours.map((hour, index) => (
                <div key={hour} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{hour}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${80 - index * 15}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{80 - index * 15}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Zones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Popular Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.popularZones.map((zone, index) => (
              <div key={zone.name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{zone.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(zone.count / metrics.popularZones[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{zone.count} users</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Weekly Check-in Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 space-x-2">
            {metrics.weeklyTrend.map((day) => (
              <div key={day.day} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                  style={{ height: `${(day.checkIns / 145) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{day.day}</span>
                <span className="text-xs font-medium">{day.checkIns}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partner Actions */}
      {isPartner && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Zap className="w-5 h-5 mr-2" />
              Partner Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-green-600 hover:bg-green-700">
                <Target className="w-4 h-4 mr-2" />
                Promote Event
              </Button>
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 