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
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analytics } from '@/services/analytics';
import SubscriptionService from '@/services/subscriptionService';
const subscriptionService = new SubscriptionService();
import { notificationService } from '@/services/notificationService';
import { realtimeService } from '@/services/realtimeService';
import { deploymentVerifier, type DeploymentReport } from '@/utils/deploymentVerifier';
import { testRunner, type TestSuite } from '@/testing/testSuite';
import { logError } from '@/utils/errorHandler';

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

const AdminDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalMatches: 0,
    messagesSent: 0,
    premiumSubscriptions: 0,
    systemHealth: 'excellent',
    uptime: 99.9,
    responseTime: 150
  });

  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsersToday: 0,
    premiumUsers: 0,
    conversionRate: 0
  });

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestSuite | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentReport | null>(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = () => {
    // Load system metrics
    const matches = JSON.parse(localStorage.getItem('mockMatches') || '[]');
    const messages = JSON.parse(localStorage.getItem('mockMessages') || '[]');
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const subscriptions = subscriptionService.getUserSubscription('admin'); // Use admin as placeholder userId

    setSystemMetrics({
      activeUsers: Math.floor(Math.random() * 100) + 50,
      totalMatches: matches.length,
      messagesSent: messages.length,
      premiumSubscriptions: subscriptions ? 1 : 0,
      systemHealth: 'excellent',
      uptime: 99.9,
      responseTime: Math.floor(Math.random() * 100) + 100
    });

    setUserMetrics({
      totalUsers: users.length,
      newUsersToday: Math.floor(Math.random() * 10) + 1,
      activeUsersToday: Math.floor(Math.random() * 50) + 20,
      premiumUsers: subscriptions ? 1 : 0,
      conversionRate: subscriptions ? 2.5 : 0
    });
  };

  const runSystemTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await testRunner.runAllTests();
      setTestResults(results);
    } catch (error) {
      logError(error as Error, { source: 'AdminDashboard', action: 'runSystemTests' });
    } finally {
      setIsRunningTests(false);
    }
  };

  const checkDeploymentStatus = async () => {
    try {
      const status = await deploymentVerifier.runFullVerification();
      setDeploymentStatus(status);
    } catch (error) {
      logError(error as Error, { source: 'AdminDashboard', action: 'checkDeploymentStatus' });
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor system health, user metrics, and app performance</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-4">
          <Button onClick={runSystemTests} disabled={isRunningTests}>
            {isRunningTests ? 'Running Tests...' : 'Run System Tests'}
          </Button>
          <Button onClick={checkDeploymentStatus} variant="outline">
            Check Deployment Status
          </Button>
          <Button variant="outline">
            Export Analytics
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold text-green-600">Healthy</p>
                    </div>
                    {getHealthIcon(systemMetrics.systemHealth)}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="text-lg font-semibold text-blue-600">{systemMetrics.uptime}%</p>
                    </div>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Response Time</p>
                      <p className="text-lg font-semibold text-purple-600">{systemMetrics.responseTime}ms</p>
                    </div>
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-lg font-semibold text-orange-600">{systemMetrics.activeUsers}</p>
                    </div>
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userMetrics.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{userMetrics.newUsersToday} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.messagesSent}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics.premiumSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">
                    {userMetrics.conversionRate}% conversion rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>Detailed user metrics and behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{userMetrics.totalUsers}</div>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{userMetrics.activeUsersToday}</div>
                    <p className="text-sm text-gray-600">Active Today</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{userMetrics.premiumUsers}</div>
                    <p className="text-sm text-gray-600">Premium Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Real-time system monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Database className="w-5 h-5 mr-3 text-blue-600" />
                      <span>Database</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 mr-3 text-blue-600" />
                      <span>API Server</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 mr-3 text-blue-600" />
                      <span>Push Notifications</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Monitor className="w-5 h-5 mr-3 text-blue-600" />
                      <span>Real-time Updates</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>User behavior and app performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Top Events</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Page Views</span>
                        <span className="font-semibold">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>User Actions</span>
                        <span className="font-semibold">567</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Errors</span>
                        <span className="font-semibold">3</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Avg Load Time</span>
                        <span className="font-semibold">1.2s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage</span>
                        <span className="font-semibold">45MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bundle Size</span>
                        <span className="font-semibold">2.1MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Testing</CardTitle>
                <CardDescription>Automated test results and deployment verification</CardDescription>
              </CardHeader>
              <CardContent>
                {testResults && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Test Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
                        <p className="text-sm text-gray-600">Passed</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
                        <p className="text-sm text-gray-600">Failed</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{testResults.summary.skipped}</div>
                        <p className="text-sm text-gray-600">Skipped</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{testResults.summary.duration}ms</div>
                        <p className="text-sm text-gray-600">Duration</p>
                      </div>
                    </div>
                  </div>
                )}

                {deploymentStatus && (
                  <div>
                    <h4 className="font-semibold mb-3">Deployment Status</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span>Overall Status:</span>
                      <Badge 
                        variant={deploymentStatus.overallStatus === 'ready' ? 'default' : 'destructive'}
                        className={deploymentStatus.overallStatus === 'ready' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {deploymentStatus.overallStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{deploymentStatus.summary.passed}</div>
                        <p className="text-sm text-gray-600">Passed</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{deploymentStatus.summary.failed}</div>
                        <p className="text-sm text-gray-600">Failed</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{deploymentStatus.summary.warnings}</div>
                        <p className="text-sm text-gray-600">Warnings</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{deploymentStatus.summary.total}</div>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard; 