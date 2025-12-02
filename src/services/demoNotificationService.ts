// Demo Notification Service
// Provides demo notifications for testing and demonstration

import { toast } from '@/hooks/use-toast';
import { Bell, Heart, MessageCircle, MapPin, Sparkles } from 'lucide-react';

export interface DemoNotification {
  id: string;
  type: 'match' | 'message' | 'checkin' | 'reconnect' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

class DemoNotificationService {
  private notifications: DemoNotification[] = [];
  private listeners: Set<(notifications: DemoNotification[]) => void> = new Set();
  private notificationInterval: ReturnType<typeof setInterval> | null = null; // Track interval for cleanup

  constructor() {
    // Load from localStorage
    this.loadNotifications();
    
    // Start demo notification generator
    this.startDemoNotifications();
  }

  private loadNotifications() {
    try {
      const stored = localStorage.getItem('mingle:demo_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem('mingle:demo_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private startDemoNotifications() {
    // Generate demo notifications periodically
    const intervals = [
      { delay: 5000, type: 'match' as const, title: 'New Match! 🎉', message: 'You matched with Sarah at Club Aurora' },
      { delay: 12000, type: 'message' as const, title: 'New Message', message: 'Alex sent you a message' },
      { delay: 20000, type: 'checkin' as const, title: 'Check-in Reminder', message: 'You\'re still checked in at Neon Garden' },
      { delay: 30000, type: 'reconnect' as const, title: 'Reconnect Request', message: 'Someone wants to reconnect with you' },
    ];

    intervals.forEach(({ delay, type, title, message }) => {
      setTimeout(() => {
        this.createNotification(type, title, message);
      }, delay);
    });

    // Continue generating random notifications every 30-60 seconds
    // CRITICAL: Store interval ID for cleanup
    this.notificationInterval = setInterval(() => {
      const types: DemoNotification['type'][] = ['match', 'message', 'checkin', 'system'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const messages = {
        match: ['New Match! 🎉', 'You matched with someone new'],
        message: ['New Message', 'You have an unread message'],
        checkin: ['Check-in Reminder', 'Don\'t forget to check in at venues'],
        system: ['Welcome to Mingle!', 'Start meeting people at venues near you'],
      };

      const randomMessages = messages[randomType];
      const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      
      this.createNotification(randomType, randomMessage, randomMessage);
    }, 30000 + Math.random() * 30000); // 30-60 seconds
  }
  
  // Cleanup method to stop notification generation
  stop(): void {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }

  createNotification(
    type: DemoNotification['type'],
    title: string,
    message: string,
    actionUrl?: string
  ): DemoNotification {
    const notification: DemoNotification = {
      id: `demo_${Date.now()}_${Math.random()}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      actionUrl,
    };

    this.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifyListeners();

    // Show toast notification
    this.showToast(notification);

    return notification;
  }

  private showToast(notification: DemoNotification) {
    // Use the toast function from hooks
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000,
    });
  }

  getNotifications(): DemoNotification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  subscribe(listener: (notifications: DemoNotification[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}

export const demoNotificationService = new DemoNotificationService();

