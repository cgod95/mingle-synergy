import { doc, updateDoc, increment, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { analytics } from './analytics';

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

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  constructor() {
    this.isSupported = 'Notification' in window;
    this.loadNotifications();
    this.requestNotificationPermission();
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

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied';

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: NotificationData[]) => void) {
    this.listeners.push(callback);
    callback(this.notifications);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Add a new notification
  addNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) {
    const newNotification: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifyListeners();
    this.showBrowserNotification(newNotification);
  }

  // Show browser notification
  private async showBrowserNotification(notification: NotificationData): Promise<void> {
    if (this.permission !== 'granted' || !this.isSupported) return;

    const options: NotificationOptions = {
      body: notification.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: notification.type,
      data: notification.data,
      requireInteraction: notification.priority === 'high',
      silent: false
    };

    try {
      const browserNotification = new Notification(notification.title, options);
      
      browserNotification.onclick = () => {
        this.markAsRead(notification.id);
        this.handleNotificationClick(notification);
        browserNotification.close();
      };

      // Auto-close after 5 seconds for low priority
      if (notification.priority === 'low') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  // Handle notification clicks
  private handleNotificationClick(notification: NotificationData) {
    switch (notification.type) {
      case 'match':
        window.location.href = `/matches`;
        break;
      case 'message':
        window.location.href = `/messages`;
        break;
      case 'venue_checkin':
        window.location.href = `/venue/${notification.data?.venueId}`;
        break;
      case 'proximity_alert':
        window.location.href = `/venue/${notification.data?.venueId}`;
        break;
      case 'match_expiring':
        window.location.href = `/matches`;
        break;
      case 'reconnect_request':
        window.location.href = `/matches`;
        break;
      case 'venue_activity':
        window.location.href = `/venue/${notification.data?.venueId}`;
        break;
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get notifications
  getNotifications(): NotificationData[] {
    return this.notifications;
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // Delete specific notification
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Mingle-specific notification methods
  notifyNewMatch(matchData: { matchId: string; userName: string; venueName: string }) {
    this.addNotification({
      type: 'match',
      title: 'New Match! 💕',
      body: `You matched with ${matchData.userName} at ${matchData.venueName}!`,
      data: { matchId: matchData.matchId, venueName: matchData.venueName },
      priority: 'high'
    });
  }

  notifyNewMessage(messageData: { senderName: string; message: string; matchId: string }) {
    this.addNotification({
      type: 'message',
      title: `Message from ${messageData.senderName}`,
      body: messageData.message,
      data: { matchId: messageData.matchId },
      priority: 'normal'
    });
  }

  notifyVenueCheckIn(venueData: { venueName: string; venueId: string; peopleCount: number }) {
    this.addNotification({
      type: 'venue_checkin',
      title: 'Successfully checked in! 📍',
      body: `You're now visible to ${venueData.peopleCount} people at ${venueData.venueName}`,
      data: { venueId: venueData.venueId, venueName: venueData.venueName },
      priority: 'normal'
    });
  }

  notifyProximityAlert(proximityData: { venueName: string; venueId: string; newPeopleCount: number }) {
    this.addNotification({
      type: 'proximity_alert',
      title: 'New people nearby! 👥',
      body: `${proximityData.newPeopleCount} new people checked in at ${proximityData.venueName}`,
      data: { venueId: proximityData.venueId, venueName: proximityData.venueName },
      priority: 'low'
    });
  }

  notifyMatchExpiring(matchData: { matchId: string; userName: string; timeLeft: string }) {
    this.addNotification({
      type: 'match_expiring',
      title: 'Match expiring soon! ⏰',
      body: `Your match with ${matchData.userName} expires in ${matchData.timeLeft}`,
      data: { matchId: matchData.matchId },
      priority: 'high'
    });
  }

  notifyReconnectRequest(reconnectData: { matchId: string; userName: string; venueName: string }) {
    this.addNotification({
      type: 'reconnect_request',
      title: 'Reconnection request! 🔄',
      body: `${reconnectData.userName} wants to reconnect at ${reconnectData.venueName}`,
      data: { matchId: reconnectData.matchId },
      priority: 'normal'
    });
  }

  notifyVenueActivity(activityData: { venueName: string; venueId: string; activity: string }) {
    this.addNotification({
      type: 'venue_activity',
      title: `Activity at ${activityData.venueName}`,
      body: activityData.activity,
      data: { venueId: activityData.venueId, venueName: activityData.venueName },
      priority: 'low'
    });
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.permission === 'granted';
  }

  // Get permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
