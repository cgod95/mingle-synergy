import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  MapPin, 
  TrendingUp, 
  Activity,
  Clock,
  Zap,
  Eye,
  MousePointer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analytics } from '@/services/analytics';

interface LiveUser {
  id: string;
  name: string;
  action: string;
  timestamp: number;
  location?: string;
}

interface RealTimeMetrics {
  activeUsers: number;
  totalSessions: number;
  matchesCreated: number;
  messagesSent: number;
  checkIns: number;
  averageSessionDuration: number;
}

interface ActivityStream {
  users: LiveUser[];
  events: Array<{
    type: string;
    description: string;
    timestamp: number;
    userId?: string;
  }>;
}

export const RealTimeDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeUsers: 0,
    totalSessions: 0,
    matchesCreated: 0,
    messagesSent: 0,
    checkIns: 0,
    averageSessionDuration: 0
  });
  
  const [activityStream, setActivityStream] = useState<ActivityStream>({
    users: [],
    events: []
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const wsRef = useRef<WebSocket | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        matchesCreated: prev.matchesCreated + Math.floor(Math.random() * 3),
        messagesSent: prev.messagesSent + Math.floor(Math.random() * 10),
        checkIns: prev.checkIns + Math.floor(Math.random() * 2)
      }));

      // Add new activity
      const newUser: LiveUser = {
        id: `user-${Date.now()}`,
        name: `User ${Math.floor(Math.random() * 1000)}`,
        action: ['checked in', 'liked someone', 'sent a message', 'matched'][Math.floor(Math.random() * 4)],
        timestamp: Date.now(),
        location: ['Downtown', 'Midtown', 'Uptown'][Math.floor(Math.random() * 3)]
      };

      setActivityStream(prev => ({
        users: [newUser, ...prev.users.slice(0, 19)], // Keep last 20
        events: [
          {
            type: 'user_action',
            description: `${newUser.name} ${newUser.action}`,
            timestamp: Date.now(),
            userId: newUser.id
          },
          ...prev.events.slice(0, 19) // Keep last 20
        ]
      }));

      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Only connect if VITE_WS_URL is properly configured
    const wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl || wsUrl === 'undefined' || wsUrl.includes('undefined')) {
      console.warn('WebSocket URL not configured. Real-time features disabled.');
      return;
    }

    const connectWebSocket = () => {
      try {
        // Validate URL before creating WebSocket
        if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
          console.error('Invalid WebSocket URL format:', wsUrl);
          return;
        }

        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          setIsConnected(true);
          console.log('Real-time dashboard connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Handle real-time updates
            if (data.type === 'user_activity') {
              // Update metrics and activity stream
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          console.log('Real-time dashboard disconnected');
          // Only reconnect if URL is still valid
          if (wsUrl && !wsUrl.includes('undefined')) {
            setTimeout(connectWebSocket, 5000);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  }> = ({ title, value, icon, trend, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <div className="flex items-center mt-2">
                  <TrendingUp 
                    className={`w-4 h-4 mr-1 ${
                      trend === 'up' ? 'text-green-500' : 
                      trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`} 
                  />
                  <span className="text-xs text-muted-foreground">
                    {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : '0%'} from last hour
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Dashboard</h1>
          <p className="text-muted-foreground">
            Live monitoring of user activity and system performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          trend="up"
          color="blue"
        />
        <MetricCard
          title="Total Sessions"
          value={metrics.totalSessions}
          icon={<Activity className="w-6 h-6 text-green-600" />}
          trend="up"
          color="green"
        />
        <MetricCard
          title="Matches Created"
          value={metrics.matchesCreated}
          icon={<Heart className="w-6 h-6 text-red-600" />}
          trend="up"
          color="red"
        />
        <MetricCard
          title="Messages Sent"
          value={metrics.messagesSent}
          icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
          trend="up"
          color="purple"
        />
        <MetricCard
          title="Check-ins"
          value={metrics.checkIns}
          icon={<MapPin className="w-6 h-6 text-orange-600" />}
          trend="neutral"
          color="orange"
        />
        <MetricCard
          title="Avg Session"
          value={`${Math.floor(metrics.averageSessionDuration / 60)}m ${metrics.averageSessionDuration % 60}s`}
          icon={<Clock className="w-6 h-6 text-indigo-600" />}
          trend="up"
          color="indigo"
        />
      </div>

      {/* Activity Stream */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Live Users</TabsTrigger>
          <TabsTrigger value="events">Activity Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Live User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {activityStream.users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.action} {user.location && `at ${user.location}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.timestamp).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MousePointer className="w-5 h-5 mr-2" />
                System Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {activityStream.events.map((event, index) => (
                    <motion.div
                      key={`${event.type}-${event.timestamp}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Event type: {event.type}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 