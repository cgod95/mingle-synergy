import { doc, updateDoc, increment, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';

// Notification service implementation

export class NotificationService {
  // Request user permission for notifications
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }
    
    if (Notification.permission === "granted") {
      return true;
    }
    
    if (Notification.permission !== "denied") {
      try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
      }
    }
    
    return false;
  }
  
  // Show a notification to the user
  showNotification(title: string, options: NotificationOptions = {}): void {
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          icon: '/logo.png',
          ...options
        });
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    }
  }
  
  // Store user's notification preference in Firestore
  async updateUserNotificationSettings(userId: string, enabled: boolean): Promise<void> {
    // In a real implementation, store this in Firestore
    localStorage.setItem(`user_${userId}_notifications`, enabled ? 'enabled' : 'disabled');
  }

  // Setup handler for foreground notifications
  setupForegroundHandler(callback: (payload: Record<string, unknown>) => void): () => void {
    // This is where we would set up a listener for foreground messages
    // For example, with Firebase Messaging:
    // const unsubscribe = onMessage(messaging, (payload) => {
    //   callback(payload);
    // });
    
    // For now, we'll just setup a mock listener that doesn't do anything
    console.log('Setting up foreground notification handler');
    
    // Return a function to unsubscribe
    return () => {
      console.log('Cleaning up foreground notification handler');
    };
  }

  // Initialize notifications after user has logged in
  async initNotifications(publicVapidKey?: string): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      console.log('Notification permission granted');
      
      // Register for push notifications if supported and if we have a VAPID key
      if ('serviceWorker' in navigator && 'PushManager' in window && publicVapidKey) {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
          });
          
          console.log('Notification subscription:', subscription);
          
          // In a real implementation, you would send this subscription to your backend
          // saveSubscription(subscription);
        } catch (error) {
          console.error('Failed to subscribe to push notifications:', error);
        }
      }
    }
  }

  // Helper function for push subscription
  urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

export const notificationService = new NotificationService();

// Export these functions for backward compatibility
export const requestNotificationPermission = (): Promise<boolean> => {
  return notificationService.requestPermission();
};

export const initNotifications = (publicVapidKey?: string): Promise<void> => {
  return notificationService.initNotifications(publicVapidKey);
};

export const sendLocalNotification = (title: string, options: NotificationOptions = {}): void => {
  notificationService.showNotification(title, options);
};

// Export the helper function directly instead of importing it from itself
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  return notificationService.urlBase64ToUint8Array(base64String);
}

interface NotificationData {
  userId: string;
  unreadMessages: Record<string, number>;
  lastUpdated: Date;
}

/**
 * Update notification count for a specific match when a new message arrives
 */
export const updateMessageNotification = async (
  userId: string, 
  matchId: string, 
  incrementCount: boolean = true
) => {
  try {
    const notificationRef = doc(firestore, 'notifications', userId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (notificationDoc.exists()) {
      // Update existing notification document
      const data = notificationDoc.data() as NotificationData;
      const unreadMessages = data.unreadMessages || {};
      
      if (incrementCount) {
        unreadMessages[matchId] = (unreadMessages[matchId] || 0) + 1;
      } else {
        unreadMessages[matchId] = 0; // Mark as read
      }
      
      await updateDoc(notificationRef, {
        unreadMessages,
        lastUpdated: new Date()
      });
    } else {
      // Create new notification document
      const unreadMessages = incrementCount ? { [matchId]: 1 } : { [matchId]: 0 };
      
      await setDoc(notificationRef, {
        userId,
        unreadMessages,
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating message notification:', error);
  }
};

/**
 * Mark all messages in a match as read for a user
 */
export const markMatchAsRead = async (userId: string, matchId: string) => {
  await updateMessageNotification(userId, matchId, false);
};

/**
 * Get notification count for a specific match
 */
export const getNotificationCount = async (userId: string, matchId: string): Promise<number> => {
  try {
    const notificationRef = doc(firestore, 'notifications', userId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (notificationDoc.exists()) {
      const data = notificationDoc.data() as NotificationData;
      return data.unreadMessages?.[matchId] || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting notification count:', error);
    return 0;
  }
};
