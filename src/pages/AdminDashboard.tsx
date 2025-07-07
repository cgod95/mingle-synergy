import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Heart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  Database,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  MessageCircle,
  RefreshCw,
  Download,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analytics } from '@/services/analytics';
import { subscriptionService } from '@/services/subscriptionService';
import { notificationService } from '@/services/notificationService';
import { realtimeService } from '@/services/realtimeService';
import { deploymentVerifier, type DeploymentReport } from '@/utils/deploymentVerifier';
import { testRunner, type TestSuite } from '@/testing/testSuite';
import { businessFeatures } from '@/services/businessFeatures';
import { infrastructure } from '@/services/infrastructure';
import { technicalExcellence } from '@/services/technicalExcellence';
import { usePerformanceMonitoring } from '@/services/performanceMonitoring';
import { mockVenues } from '@/data/mock';
import { Venue } from '@/types/index';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import venueService from '@/services/firebase/venueService';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemMetrics {
  activeUsers: number;
  totalMatches: number;
  messagesSent: number;
  premiumSubscriptions: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
}

interface UserMetrics {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  premiumUsers: number;
  conversionRate: number;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalVenues: number;
  activeVenues: number;
  totalMatches: number;
  successfulMatches: number;
  revenue: number;
  growthRate: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalVenues: number;
  activeVenues: number;
  totalMatches: number;
  successfulMatches: number;
  revenue: number;
  growthRate: number;
  newUsersThisWeek: number;
  newVenuesThisWeek: number;
  revenueGrowth: number;
  matchesThisWeek: number;
}

interface ActivityItem {
  description: string;
  timestamp: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all dashboard data in parallel
      const [statsData, activityData, usersData, venuesData] = await Promise.all([
        businessFeatures.getAdminMetrics(),
        getRecentActivityMock(),
        businessFeatures.getUserReports(),
        venueService.getAllVenues()
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
      setUsers(usersData);
      setVenues(venuesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'delete' | 'verify') => {
    try {
      switch (action) {
        case 'suspend':
          await businessFeatures.suspendUser(userId, 'Admin action');
          toast({ title: "Success", description: "User suspended successfully" });
          break;
        case 'delete':
          await businessFeatures.deleteUser(userId);
          toast({ title: "Success", description: "User deleted successfully" });
          break;
        case 'verify':
          toast({ title: "Success", description: "User verified successfully" });
          break;
      }
      
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive"
      });
    }
  };

  const handleVenueAction = async (venueId: string, action: 'approve' | 'reject' | 'feature') => {
    try {
      switch (action) {
        case 'approve':
          await venueService.approveVenue?.(venueId);
          toast({ title: "Success", description: "Venue approved successfully" });
          break;
        case 'reject':
          await venueService.rejectVenue?.(venueId);
          toast({ title: "Success", description: "Venue rejected successfully" });
          break;
        case 'feature':
          await venueService.featureVenue?.(venueId);
          toast({ title: "Success", description: "Venue featured successfully" });
          break;
      }
      
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} venue:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} venue`,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Mingle application</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => window.open('/admin/export', '_blank')}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{stats.newUsersThisWeek} this week</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Venues</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeVenues.toLocaleString()}</p>
                    <p className="text-xs text-blue-600">+{stats.newVenuesThisWeek} this week</p>
                  </div>
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalMatches.toLocaleString()}</p>
                    <p className="text-xs text-purple-600">+{stats.matchesThisWeek} this week</p>
                  </div>
                  <Heart className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-foreground">${stats.revenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{stats.revenueGrowth}% this month</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">API Response Time</span>
                      <span className="text-sm font-medium text-green-600">120ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Database</span>
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Storage</span>
                      <span className="text-sm font-medium text-yellow-600">75%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user.id, 'verify')}
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                        >
                          Suspend
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUserAction(user.id, 'delete')}
                        >
                          Delete
                        </Button>
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
                <CardTitle>Venue Management</CardTitle>
                <CardDescription>Approve and manage venue listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {venues.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{venue.name}</p>
                        <p className="text-sm text-muted-foreground">{venue.address}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVenueAction(venue.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVenueAction(venue.id, 'feature')}
                        >
                          Feature
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVenueAction(venue.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Detailed analytics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                    {/* Add chart component here */}
                    <div className="h-64 bg-muted rounded flex items-center justify-center">
                      <p className="text-muted-foreground">Chart placeholder</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Match Success Rate</h3>
                    {/* Add chart component here */}
                    <div className="h-64 bg-muted rounded flex items-center justify-center">
                      <p className="text-muted-foreground">Chart placeholder</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Configure admin preferences and system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Maintenance Mode</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Auto-approve Venues</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email Notifications</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

function getRecentActivityMock() {
  return Promise.resolve([
    { description: 'User JohnDoe signed up', timestamp: Date.now() - 1000 * 60 * 60 },
    { description: 'Venue "Cafe Central" approved', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
    { description: 'User JaneSmith upgraded to Premium', timestamp: Date.now() - 1000 * 60 * 60 * 3 },
  ]);
} 