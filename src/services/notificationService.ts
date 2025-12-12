// Firebase imports removed - notificationService works with localStorage in demo mode
// import { doc, updateDoc, increment, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
// import { firestore } from '@/firebase/config';
import { analytics } from './analytics';
import { advancedFeatures } from './advancedFeatures';
import logger from '@/utils/Logger';
import { logError } from '@/utils/errorHandler';

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

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  private savePermission(): void {
    try {
      localStorage.setItem('mingle_notification_permission', this.permission);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        source: 'NotificationService',
        action: 'savePermission'
      });
    }
  }

  // Initialize push notifications
  private async initializePushNotifications(): Promise<void> {
    if (!this.isSupported) {
      logger.warn('Push notifications not supported');
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
      logError(error instanceof Error ? error : new Error(String(error)), {
        source: 'NotificationService',
        action: 'requestPermission'
      });
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
      };
      if (config.badge) {
        options.badge = config.badge;
      }
      if (config.tag) {
        options.tag = config.tag;
      }
      if (config.data) {
        options.data = config.data;
      }
      if (config.requireInteraction !== undefined) {
        options.requireInteraction = config.requireInteraction;
      }
      if (config.silent !== undefined) {
        options.silent = config.silent;
      }

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
      logError(error instanceof Error ? error : new Error(String(error)), {
        source: 'NotificationService',
        action: 'sendLocalNotification'
      });
      return '';
    }
  }

  // Send match notification
  async notifyNewMatch(matchData: {
    userId: string;
    matchId: string;
    otherUserId: string;
    compatibility?: number;
    mutualInterests?: string[];
  }): Promise<void> {
    // Get user names for notification
    try {
      const { userService } = await import('@/services');
      const otherUser = await userService.getUserProfile(matchData.otherUserId);
      const otherUserName = otherUser?.name || 'Someone';
      
      await this.sendMatchNotification({
        matchId: matchData.matchId,
        matchedUserName: otherUserName,
        venueName: 'your venue' // Could be enhanced to get actual venue name
      });
    } catch (error) {
      // Fallback if user lookup fails
      await this.sendMatchNotification({
        matchId: matchData.matchId,
        matchedUserName: 'Someone',
        venueName: 'your venue'
      });
    }
  }

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
    const notification: NotificationData = {
      id: `venue_${venueData.venueId}`,
      type: 'venue_activity',
      title: 'Venue Update',
      body: `${venueData.userCount} people are now at ${venueData.venueName}`,
      data: venueData as Record<string, string | number | boolean>,
      timestamp: Date.now(),
      read: false
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
    return this.notifications.map(n => this.convertToNotification(n));
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications
      .filter(n => !n.read)
      .map(n => this.convertToNotification(n));
  }

  // Convert NotificationData to Notification
  private convertToNotification(data: NotificationData): Notification {
    return {
      id: data.id,
      type: data.type === 'venue_activity' ? 'venue' : 
            data.type === 'reconnect_request' ? 'reconnect' :
            data.type === 'match_expiring' ? 'system' :
            data.type === 'match' ? 'match' :
            data.type === 'message' ? 'message' : 'system',
      title: data.title,
      message: data.body,
      data: data.data as Record<string, unknown>,
      timestamp: data.timestamp,
      read: data.read,
      actionUrl: data.type === 'venue_activity' && data.data?.venueId ? `/venue/${String(data.data.venueId)}` : undefined
    };
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

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      this.savePermission();
      
      if (permission === 'granted') {
        analytics.track('notification_permission_granted', {
          timestamp: Date.now()
        });
      }
      
      return permission;
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        source: 'NotificationService',
        action: 'requestPermission'
      });
      return 'denied';
    }
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately call with current notifications
    callback([...this.notifications]);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }


  // Clear all notifications (alias for clearAllNotifications)
  clearAll(): void {
    this.clearAllNotifications();
  }

  // Show notification (alias for sendLocalNotification)
  async showNotification(title: string, options?: { body?: string; icon?: string; data?: Record<string, unknown> }): Promise<void> {
    await this.sendLocalNotification({
      title,
      body: options?.body || '',
      icon: options?.icon,
      data: options?.data
    });
  }

  // Notify venue activity
  async notifyVenueActivity(data: { venueId: string; venueName: string; activity?: string; userCount?: number }): Promise<void> {
    const notification: NotificationData = {
      id: `venue_activity_${data.venueId}_${Date.now()}`,
      type: 'venue_activity',
      title: 'Venue Activity',
      body: data.activity || `${data.userCount || 0} people are at ${data.venueName}`,
      data: data as Record<string, string | number | boolean>,
      timestamp: Date.now(),
      read: false
    };
    this.addNotification(notification);
    await this.sendLocalNotification({
      title: 'Venue Activity',
      body: data.activity || `${data.userCount || 0} people are at ${data.venueName}`,
      icon: '/logo192.png',
      tag: 'venue_activity',
      data
    });
  }

  // Notify venue check-in
  async notifyVenueCheckIn(data: { venueId: string; venueName: string; peopleCount: number }): Promise<void> {
    const notification: NotificationData = {
      id: `checkin_${data.venueId}_${Date.now()}`,
      type: 'venue_checkin',
      title: 'Checked in!',
      body: `${data.peopleCount} people are at ${data.venueName}`,
      data: data as Record<string, string | number | boolean>,
      timestamp: Date.now(),
      read: false
    };
    this.addNotification(notification);
    await this.sendLocalNotification({
      title: 'Checked in!',
      body: `${data.peopleCount} people are at ${data.venueName}`,
      icon: '/logo192.png',
      tag: 'checkin',
      data
    });
  }

  // Notify proximity alert
  async notifyProximityAlert(data: { venueName: string; venueId: string; newPeopleCount: number }): Promise<void> {
    const notification: NotificationData = {
      id: `proximity_${data.venueId}_${Date.now()}`,
      type: 'proximity_alert',
      title: 'New people nearby!',
      body: `${data.newPeopleCount} new ${data.newPeopleCount === 1 ? 'person' : 'people'} at ${data.venueName}`,
      data: data as Record<string, string | number | boolean>,
      timestamp: Date.now(),
      read: false
    };
    this.addNotification(notification);
    await this.sendLocalNotification({
      title: 'New people nearby!',
      body: `${data.newPeopleCount} new ${data.newPeopleCount === 1 ? 'person' : 'people'} at ${data.venueName}`,
      icon: '/logo192.png',
      tag: 'proximity',
      data
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
