import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Database, 
  Activity,
  BarChart3,
  Settings,
  UserCheck,
  UserX,
  MapPin,
  MessageSquare,
  Heart,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import PrivateLayout from '@/components/PrivateLayout';
import { toast } from '@/components/ui/use-toast';
import logger from '@/utils/Logger';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  totalMessages: number;
  totalVenues: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
}

interface UserAnalytics {
  newUsers: number;
  returningUsers: number;
  churnRate: number;
  averageSessionTime: number;
  topVenues: Array<{ name: string; checkins: number; matches: number }>;
  userGrowth: Array<{ date: string; users: number }>;
}

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivity: number;
  blockedUsers: number;
  dataBreaches: number;
  lastSecurityScan: string;
}

const AdvancedAdmin: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [security, setSecurity] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, refreshInterval);
    return () => clearInterval(interval);
  }, [timeRange, refreshInterval]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - in real app, fetch from admin API
      const mockMetrics: SystemMetrics = {
        totalUsers: 15420,
        activeUsers: 3247,
        totalMatches: 45678,
        totalMessages: 234567,
        totalVenues: 892,
        systemHealth: 'healthy',
        uptime: 99.97,
        responseTime: 245,
        errorRate: 0.02
      };

      const mockAnalytics: UserAnalytics = {
        newUsers: 234,
        returningUsers: 2891,
        churnRate: 0.08,
        averageSessionTime: 12.5,
        topVenues: [
          { name: 'Downtown Coffee Shop', checkins: 456, matches: 234 },
          { name: 'Central Park', checkins: 389, matches: 198 },
          { name: 'Tech Meetup', checkins: 234, matches: 156 },
          { name: 'Local Bar', checkins: 198, matches: 123 },
          { name: 'Gym', checkins: 145, matches: 89 }
        ],
        userGrowth: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          users: 15000 + Math.floor(Math.random() * 500)
        }))
      };

      const mockSecurity: SecurityMetrics = {
        failedLogins: 23,
        suspiciousActivity: 5,
        blockedUsers: 12,
        dataBreaches: 0,
        lastSecurityScan: new Date().toISOString()
      };

      setMetrics(mockMetrics);
      setAnalytics(mockAnalytics);
      setSecurity(mockSecurity);

    } catch (error) {
      logger.error('Failed to load admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemAction = async (action: string) => {
    try {
      // Mock system actions
      toast({
        title: "System Action",
        description: `${action} initiated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()}`,
        variant: "destructive"
      });
    }
  };

  const exportData = async (type: string) => {
    try {
      // Mock data export
      toast({
        title: "Export Started",
        description: `Exporting ${type} data...`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="max-w-7xl mx-auto p-4">
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

  if (!metrics || !analytics || !security) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-50 pb-20">
          <div className="max-w-7xl mx-auto p-4">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No Admin Data Available</h2>
              <p className="text-gray-600">Unable to load admin dashboard data</p>
            </div>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-7xl mx-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Admin Dashboard</h1>
            <p className="text-gray-600">Comprehensive system monitoring and analytics</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as '24h' | '7d' | '30d' | '90d')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000">Refresh 10s</SelectItem>
                  <SelectItem value="30000">Refresh 30s</SelectItem>
                  <SelectItem value="60000">Refresh 1m</SelectItem>
                  <SelectItem value="300000">Refresh 5m</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={loadAdminData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => exportData('analytics')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Health</p>
                    <p className={`text-2xl font-bold ${getHealthColor(metrics.systemHealth)}`}>
                      {metrics.systemHealth.toUpperCase()}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Uptime: {metrics.uptime}%</p>
                  <p className="text-sm text-gray-600">Response: {metrics.responseTime}ms</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Active: {metrics.activeUsers.toLocaleString()}</p>
                  <Progress value={(metrics.activeUsers / metrics.totalUsers) * 100} className="h-2 mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Matches</p>
                    <p className="text-2xl font-bold">{metrics.totalMatches.toLocaleString()}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Messages: {metrics.totalMessages.toLocaleString()}</p>
                  <Progress value={75} className="h-2 mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold">{metrics.errorRate}%</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Last 24 hours</p>
                  <Progress value={100 - metrics.errorRate} className="h-2 mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      User Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">New Users: {analytics.newUsers}</span>
                        <span className="text-sm font-medium">Returning: {analytics.returningUsers}</span>
                      </div>
                      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-gray-500">Chart: User Growth Over Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Venues */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Top Venues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topVenues.map((venue, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{venue.name}</p>
                            <p className="text-sm text-gray-600">
                              {venue.checkins} check-ins • {venue.matches} matches
                            </p>
                          </div>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Churn Rate</p>
                      <p className="text-2xl font-bold">{(analytics.churnRate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg Session Time</p>
                      <p className="text-2xl font-bold">{analytics.averageSessionTime}m</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Active Users</p>
                      <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* User Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => handleSystemAction('Bulk User Verification')}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Verify Users
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleSystemAction('User Cleanup')}>
                      <UserX className="w-4 h-4 mr-2" />
                      Cleanup Inactive
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => exportData('users')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Users
                    </Button>
                  </CardContent>
                </Card>

                {/* User Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">New Users</span>
                        <Badge variant="default">{analytics.newUsers}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Returning Users</span>
                        <Badge variant="secondary">{analytics.returningUsers}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Churned Users</span>
                        <Badge variant="destructive">
                          {Math.round(metrics.totalUsers * analytics.churnRate)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{security.failedLogins}</p>
                        <p className="text-sm text-gray-600">Failed Logins</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{security.suspiciousActivity}</p>
                        <p className="text-sm text-gray-600">Suspicious Activity</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{security.blockedUsers}</p>
                        <p className="text-sm text-gray-600">Blocked Users</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{security.dataBreaches}</p>
                        <p className="text-sm text-gray-600">Data Breaches</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last Security Scan: {new Date(security.lastSecurityScan).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                {/* Security Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => handleSystemAction('Security Scan')}>
                      <Shield className="w-4 h-4 mr-2" />
                      Run Security Scan
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleSystemAction('Block Suspicious Users')}>
                      <UserX className="w-4 h-4 mr-2" />
                      Block Suspicious
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => exportData('security')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Security Log
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Uptime</span>
                        <span className="text-sm text-gray-600">{metrics.uptime}%</span>
                      </div>
                      <Progress value={metrics.uptime} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Response Time</span>
                        <span className="text-sm text-gray-600">{metrics.responseTime}ms</span>
                      </div>
                      <Progress value={100 - (metrics.responseTime / 1000) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Error Rate</span>
                        <span className="text-sm text-gray-600">{metrics.errorRate}%</span>
                      </div>
                      <Progress value={100 - metrics.errorRate} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* System Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => handleSystemAction('Database Backup')}>
                      <Database className="w-4 h-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleSystemAction('Cache Clear')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleSystemAction('System Restart')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Restart Services
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default AdvancedAdmin; 