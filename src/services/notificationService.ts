
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
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    
    return false;
  }
  
  // Show a notification to the user
  showNotification(title: string, options: NotificationOptions = {}): void {
    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: '/logo.png',
        ...options
      });
    }
  }
  
  // Store user's notification preference in Firestore
  async updateUserNotificationSettings(userId: string, enabled: boolean): Promise<void> {
    // In a real implementation, store this in Firestore
    localStorage.setItem(`user_${userId}_notifications`, enabled ? 'enabled' : 'disabled');
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

export { urlBase64ToUint8Array } from './notificationService';
