import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Users, 
  Clock, 
  RefreshCw,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  Zap,
  Check
} from 'lucide-react';
import { notificationService, NotificationData } from '@/services/notificationService';
import { useToast } from '@/components/ui/use-toast';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationData['type']) => {
  switch (type) {
    case 'match':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'message':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'venue_checkin':
      return <MapPin className="w-4 h-4 text-green-500" />;
    case 'proximity_alert':
      return <Users className="w-4 h-4 text-purple-500" />;
    case 'match_expiring':
      return <Clock className="w-4 h-4 text-orange-500" />;
    case 'reconnect_request':
      return <RefreshCw className="w-4 h-4 text-indigo-500" />;
    case 'venue_activity':
      return <Zap className="w-4 h-4 text-yellow-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: NotificationData['type']) => {
  switch (type) {
    case 'match':
      return 'border-red-200 bg-red-50';
    case 'message':
      return 'border-blue-200 bg-blue-50';
    case 'venue_checkin':
      return 'border-green-200 bg-green-50';
    case 'proximity_alert':
      return 'border-purple-200 bg-purple-50';
    case 'match_expiring':
      return 'border-orange-200 bg-orange-50';
    case 'reconnect_request':
      return 'border-indigo-200 bg-indigo-50';
    case 'venue_activity':
      return 'border-yellow-200 bg-yellow-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'matches' | 'venue'>('all');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((notifs) => {
      setNotifications(notifs);
    });

    // Get current permission status
    setPermissionStatus(notificationService.getPermissionStatus());

    return unsubscribe;
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const permission = await notificationService.requestNotificationPermission();
    setPermissionStatus(permission);
    
    if (permission === 'granted') {
      toast({
        title: "Notifications enabled! 🔔",
        description: "You'll now receive real-time updates about matches and venue activity",
      });
    } else {
      toast({
        title: "Notifications disabled",
        description: "You can enable them later in your browser settings",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    toast({
      title: "All notifications marked as read",
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
  };

  const handleClearAll = () => {
    notificationService.clearAll();
    toast({
      title: "All notifications cleared",
    });
  };

  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'matches':
        filtered = filtered.filter(n => n.type === 'match' || n.type === 'match_expiring');
        break;
      case 'venue':
        filtered = filtered.filter(n => 
          n.type === 'venue_checkin' || 
          n.type === 'proximity_alert' || 
          n.type === 'venue_activity'
        );
        break;
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClose()}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -top-1 -right-1"
          >
            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onClose()}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center text-gray-500"
                >
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </motion.div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Card
                        className={`mb-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          !notification.read ? 'ring-2 ring-blue-200' : ''
                        } ${getNotificationColor(notification.type)}`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {getTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            {!notification.read && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 