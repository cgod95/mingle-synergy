import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/services/analytics';

interface VenueAnalyticsProps {
  venueId: string;
  venueName: string;
  className?: string;
}

interface AnalyticsData {
  overview: {
    totalCheckIns: number;
    activeUsers: number;
    totalMatches: number;
    totalMessages: number;
    averageRating: number;
    revenue: number;
  };
  trends: {
    dailyCheckIns: Array<{ date: string; count: number }>;
    hourlyActivity: Array<{ hour: number; count: number }>;
    weeklyMatches: Array<{ week: string; count: number }>;
  };
  demographics: {
    ageGroups: Array<{ range: string; count: number; percentage: number }>;
    genderDistribution: Array<{ gender: string; count: number; percentage: number }>;
    interests: Array<{ interest: string; count: number; percentage: number }>;
  };
  performance: {
    matchRate: number;
    messageResponseRate: number;
    userRetentionRate: number;
    averageSessionDuration: number;
    peakHours: string[];
    popularFeatures: Array<{ feature: string; usage: number }>;
  };
}

const VenueAnalytics: React.FC<VenueAnalyticsProps> = ({ 
  venueId, 
  venueName, 
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'demographics' | 'performance'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would come from an API
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalCheckIns: 1247,
      activeUsers: 89,
      totalMatches: 342,
      totalMessages: 2156,
      averageRating: 4.2,
      revenue: 2847.50
    },
    trends: {
      dailyCheckIns: [
        { date: '2024-01-01', count: 45 },
        { date: '2024-01-02', count: 52 },
        { date: '2024-01-03', count: 38 },
        { date: '2024-01-04', count: 67 },
        { date: '2024-01-05', count: 89 },
        { date: '2024-01-06', count: 76 },
        { date: '2024-01-07', count: 94 }
      ],
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 50) + 10
      })),
      weeklyMatches: [
        { week: 'Week 1', count: 23 },
        { week: 'Week 2', count: 31 },
        { week: 'Week 3', count: 28 },
        { week: 'Week 4', count: 35 }
      ]
    },
    demographics: {
      ageGroups: [
        { range: '18-24', count: 156, percentage: 35 },
        { range: '25-34', count: 234, percentage: 52 },
        { range: '35-44', count: 45, percentage: 10 },
        { range: '45+', count: 12, percentage: 3 }
      ],
      genderDistribution: [
        { gender: 'Female', count: 267, percentage: 59 },
        { gender: 'Male', count: 180, percentage: 41 }
      ],
      interests: [
        { interest: 'Music', count: 189, percentage: 42 },
        { interest: 'Sports', count: 134, percentage: 30 },
        { interest: 'Food', count: 156, percentage: 35 },
        { interest: 'Travel', count: 98, percentage: 22 },
        { interest: 'Art', count: 67, percentage: 15 }
      ]
    },
    performance: {
      matchRate: 0.68,
      messageResponseRate: 0.74,
      userRetentionRate: 0.82,
      averageSessionDuration: 12.5,
      peakHours: ['7 PM', '8 PM', '9 PM', '10 PM'],
      popularFeatures: [
        { feature: 'Profile Boost', usage: 156 },
        { feature: 'Super Likes', usage: 89 },
        { feature: 'Advanced Filters', usage: 234 },
        { feature: 'Read Receipts', usage: 178 }
      ]
    }
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        analytics.track('venue_analytics_viewed', {
          venue_id: venueId,
          venue_name: venueName,
          time_range: timeRange
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [venueId, venueName, timeRange]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'performance', label: 'Performance', icon: Activity }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          <Activity className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-neutral-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {venueName} Analytics
          </h2>
          <p className="text-neutral-400">
            Real-time insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'trends' | 'demographics' | 'performance')}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/10",
                activeTab === tab.id
                  ? "bg-blue-900/50 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-neutral-400 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Total Check-ins</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(analyticsData.overview.totalCheckIns)}
                  </p>
                </div>
                <div className="p-2 bg-blue-900/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% from last period
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.overview.activeUsers}
                  </p>
                </div>
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.3% from last period
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Total Matches</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(analyticsData.overview.totalMatches)}
                  </p>
                </div>
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.2% from last period
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ${analyticsData.overview.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-violet-900/50 rounded-lg">
                  <Zap className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +22.1% from last period
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Daily Check-ins
              </h3>
              <div className="space-y-3">
                {analyticsData.trends.dailyCheckIns.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(day.count / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-8 text-right">
                        {day.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Peak Hours
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {analyticsData.trends.hourlyActivity.map((hour) => (
                  <div key={hour.hour} className="text-center">
                    <div className="text-xs text-neutral-400 mb-1">
                      {hour.hour === 0 ? '12 AM' : hour.hour <= 12 ? `${hour.hour} ${hour.hour === 12 ? 'PM' : 'AM'}` : `${hour.hour - 12} PM`}
                    </div>
                    <div className="bg-gray-200 rounded h-20 relative">
                      <div
                        className="bg-blue-600 rounded absolute bottom-0 w-full"
                        style={{ height: `${(hour.count / 60) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{hour.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Age Distribution
              </h3>
              <div className="space-y-3">
                {analyticsData.demographics.ageGroups.map((group) => (
                  <div key={group.range} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{group.range}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-12 text-right">
                        {group.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Interests
              </h3>
              <div className="space-y-3">
                {analyticsData.demographics.interests.slice(0, 5).map((interest) => (
                  <div key={interest.interest} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{interest.interest}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-violet-600 h-2 rounded-full"
                          style={{ width: `${interest.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-12 text-right">
                        {interest.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Key Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Match Rate</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatPercentage(analyticsData.performance.matchRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Response Rate</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {formatPercentage(analyticsData.performance.messageResponseRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Retention Rate</span>
                  <span className="text-lg font-semibold text-violet-600">
                    {formatPercentage(analyticsData.performance.userRetentionRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Avg Session</span>
                  <span className="text-lg font-semibold text-orange-600">
                    {analyticsData.performance.averageSessionDuration} min
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Popular Features
              </h3>
              <div className="space-y-3">
                {analyticsData.performance.popularFeatures.map((feature) => (
                  <div key={feature.feature} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{feature.feature}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(feature.usage / 250) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-12 text-right">
                        {feature.usage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VenueAnalytics; 