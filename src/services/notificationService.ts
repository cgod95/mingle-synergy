// Firebase imports removed - notificationService works with localStorage in demo mode
// import { doc, updateDoc, increment, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
// import { firestore } from '@/firebase/config';
import { analytics } from './analytics';
import { advancedFeatures } from './advancedFeatures';

// Enhanced notification service for Mingle's unique features
export interface NotificationData {
  id: string;
  type: 'match' | 'message' | 'venue_checkin' | 'proximity_alert' | 'match_expiring' | 'reconnect_request' | 'venue_activity';
  title: string;
  body: string;
  data?: Record<string, string | number | boolean>;
  priority?: 'low' | 'normal' | 'high';
  timestamp: number;
  read: boolean;
}

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'venue' | 'system' | 'reconnect';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export interface PushNotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  constructor() {
    this.isSupported = 'Notification' in window;
    this.loadNotifications();
    this.initializePushNotifications();
  }

  private loadNotifications() {
    const stored = localStorage.getItem('mingle_notifications');
    if (stored) {
      this.notifications = JSON.parse(stored);
    }
  }

  private saveNotifications() {
    localStorage.setItem('mingle_notifications', JSON.stringify(this.notifications));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Initialize push notifications
  private async initializePushNotifications(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return;
    }

    this.permission = await this.requestPermission();
    
    if (this.permission === 'granted') {
      await this.subscribeToPushNotifications();
      this.setupNotificationHandlers();
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied';

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      // Track permission request
      analytics.track('notification_permission_requested', {
        permission,
        timestamp: Date.now()
      });
      
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  // Subscribe to push notifications
  private async subscribeToPushNotifications(): Promise<void> {
    try {
      const subscription = await advancedFeatures.subscribeToPushNotifications();
      
      if (subscription) {
        analytics.track('push_notification_subscribed', {
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  // Setup notification handlers
  private setupNotificationHandlers(): void {
    // Handle notification clicks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data.notification);
        }
      });
    }
  }

  // Handle notification click
  private handleNotificationClick(notification: Notification): void {
    analytics.track('notification_clicked', {
      notificationId: notification.id,
      notificationType: notification.type,
      timestamp: Date.now()
    });

    // Navigate to relevant page (service class workaround - can't use React Router navigate)
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }

  // Send local notification
  async sendLocalNotification(config: PushNotificationConfig): Promise<string> {
    if (!this.isSupported || this.permission !== 'granted') {
      return '';
    }

    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const registration = await navigator.serviceWorker.ready;
      const options: NotificationOptions = {
        body: config.body,
        icon: config.icon || '/logo192.png',
        badge: config.badge,
        tag: config.tag,
        data: config.data,
        requireInteraction: config.requireInteraction,
        silent: config.silent
      };

      // Add actions if supported
      if (config.actions && 'actions' in options) {
        (options as Record<string, unknown>).actions = config.actions;
      }

      await registration.showNotification(config.title, options);

      // Track notification sent
      analytics.track('local_notification_sent', {
        notificationId: id,
        title: config.title,
        timestamp: Date.now()
      });

      return id;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      return '';
    }
  }

  // Send match notification
  async sendMatchNotification(matchData: {
    matchId: string;
    matchedUserName: string;
    venueName: string;
  }): Promise<void> {
    const notification: NotificationData = {
      id: `match_${matchData.matchId}`,
      type: 'match',
      title: 'New Match! 🎉',
      body: `You matched with ${matchData.matchedUserName} at ${matchData.venueName}`,
      data: matchData,
      priority: 'high',
      timestamp: Date.now(),
      read: false
    };

    this.addNotification(notification);

    // Send push notification
    await this.sendLocalNotification({
      title: 'New Match! 🎉',
      body: `You matched with ${matchData.matchedUserName} at ${matchData.venueName}`,
      icon: '/logo192.png',
      tag: 'match',
      data: matchData,
      actions: [
        {
          action: 'view',
          title: 'View Match'
        },
        {
          action: 'message',
          title: 'Send Message'
        }
      ]
    });
  }

  // Send message notification
  async sendMessageNotification(messageData: {
    messageId: string;
    senderName: string;
    message: string;
    matchId: string;
  }): Promise<void> {
    const notification: NotificationData = {
      id: `message_${messageData.messageId}`,
      type: 'message',
      title: `Message from ${messageData.senderName}`,
      body: messageData.message,
      data: messageData,
      priority: 'normal',
      timestamp: Date.now(),
      read: false
    };

    this.addNotification(notification);

    // Send push notification
    await this.sendLocalNotification({
      title: `Message from ${messageData.senderName}`,
      body: messageData.message,
      icon: '/logo192.png',
      tag: 'message',
      data: messageData,
      actions: [
        {
          action: 'reply',
          title: 'Reply'
        },
        {
          action: 'view',
          title: 'View Chat'
        }
      ]
    });
  }

  // Send venue notification
  async sendVenueNotification(venueData: {
    venueId: string;
    venueName: string;
    userCount: number;
  }): Promise<void> {
    const notification: Notification = {
      id: `venue_${venueData.venueId}`,
      type: 'venue',
      title: 'Venue Update',
      message: `${venueData.userCount} people are now at ${venueData.venueName}`,
      data: venueData,
      timestamp: Date.now(),
      read: false,
      actionUrl: `/venue/${venueData.venueId}`
    };

    this.addNotification(notification);

    // Send push notification
    await this.sendLocalNotification({
      title: 'Venue Update',
      body: `${venueData.userCount} people are now at ${venueData.venueName}`,
      icon: '/logo192.png',
      tag: 'venue',
      data: venueData
    });
  }

  // Add notification to list
  private addNotification(notification: NotificationData): void {
    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    this.saveNotifications();
    this.notifyListeners();
    
    // Track notification added
    analytics.track('notification_added', {
      notificationId: notification.id,
      notificationType: notification.type,
      timestamp: Date.now()
    });
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      
      analytics.track('notification_marked_read', {
        notificationId,
        timestamp: Date.now()
      });
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    
    analytics.track('all_notifications_marked_read', {
      timestamp: Date.now()
    });
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    
    analytics.track('notification_deleted', {
      notificationId,
      timestamp: Date.now()
    });
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
    
    analytics.track('all_notifications_cleared', {
      timestamp: Date.now()
    });
  }

  // Get notification count
  getNotificationCount(): number {
    return this.notifications.length;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
