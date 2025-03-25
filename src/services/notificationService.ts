
// Notification service implementation

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  // Check if already granted
  if (Notification.permission === 'granted') {
    return true;
  }
  
  // Check if already denied
  if (Notification.permission === 'denied') {
    console.log('Notification permission was previously denied');
    return false;
  }
  
  // Show custom modal before requesting system permission
  return new Promise((resolve) => {
    // Create modal element
    const modalContainer = document.createElement('div');
    modalContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // Modal content
    modalContainer.innerHTML = `
      <div class="bg-white rounded-lg p-6 m-4 max-w-sm">
        <h3 class="text-xl font-bold mb-4">Stay Updated with Mingle</h3>
        <p class="mb-4">Allow notifications to know when you get new matches and messages. You can always change this later.</p>
        <div class="flex justify-end space-x-3">
          <button id="notification-later" class="px-4 py-2 text-gray-600">Later</button>
          <button id="notification-allow" class="px-4 py-2 bg-brand-primary text-white rounded-lg">Allow</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    document.getElementById('notification-allow')?.addEventListener('click', async () => {
      document.body.removeChild(modalContainer);
      
      try {
        const permission = await Notification.requestPermission();
        resolve(permission === 'granted');
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        resolve(false);
      }
    });
    
    document.getElementById('notification-later')?.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
      resolve(false);
    });
  });
};

// Initialize notifications after user has logged in
export const initNotifications = async (publicVapidKey?: string): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    console.log('Notification permission granted');
    
    // Register for push notifications if supported and if we have a VAPID key
    if ('serviceWorker' in navigator && 'PushManager' in window && publicVapidKey) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
        
        console.log('Notification subscription:', subscription);
        
        // In a real implementation, you would send this subscription to your backend
        // saveSubscription(subscription);
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
      }
    }
  }
};

// Send a local notification
export const sendLocalNotification = (title: string, options: NotificationOptions = {}): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
};

// Helper function for push subscription
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
