// Advanced Service Worker for PWA

import logger from '@/utils/Logger';

const CACHE_NAME = 'mingle-v1';
const STATIC_CACHE = 'mingle-static-v1';
const DYNAMIC_CACHE = 'mingle-dynamic-v1';
const API_CACHE = 'mingle-api-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'stale-while-revalidate',
  API: 'network-first',
  IMAGES: 'cache-first',
} as const;

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/users',
  '/api/venues',
  '/api/matches',
  '/api/messages',
];

interface ServiceWorkerEvent extends Event {
  data?: unknown;
  source?: ServiceWorker;
  origin?: string;
}

interface PushEvent extends ExtendableEvent {
  data?: PushMessageData;
}

interface PushMessageData {
  json(): unknown;
  text(): string;
  arrayBuffer(): ArrayBuffer;
}

class AdvancedServiceWorker {
  private isOnline = navigator.onLine;

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // Install event
    self.addEventListener('install', (event) => {
      event.waitUntil(this.handleInstall());
    });

    // Activate event
    self.addEventListener('activate', (event) => {
      event.waitUntil(this.handleActivate());
    });

    // Fetch event
    self.addEventListener('fetch', (event) => {
      event.respondWith(this.handleFetch(event.request));
    });

    // Background sync
    self.addEventListener('sync', (event) => {
      event.waitUntil(this.handleBackgroundSync(event));
    });

    // Push notifications
    self.addEventListener('push', (event: PushEvent) => {
      logger.info('Push event received:', event);
      
      if (event.data) {
        const data = event.data.json() as { title: string; body: string; icon?: string; badge?: string; data?: unknown };
        const options: NotificationOptions = {
          body: data.body,
          icon: data.icon || '/logo192.png',
          badge: data.badge || '/logo192.png',
          data: data.data,
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'Open App',
              icon: '/logo192.png'
            },
            {
              action: 'close',
              title: 'Close',
              icon: '/logo192.png'
            }
          ]
        };
        event.waitUntil(this.handlePushNotification(event));
      }
    });

    // Notification click
    self.addEventListener('notificationclick', (event) => {
      event.waitUntil(this.handleNotificationClick(event));
    });

    // Online/offline events
    self.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    self.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });
  }

  private async handleInstall(): Promise<void> {
    logger.info('Service Worker installing...');

    // Pre-cache static files
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(STATIC_FILES);

    // Skip waiting to activate immediately
    await self.skipWaiting();
  }

  private async handleActivate(): Promise<void> {
    logger.info('Service Worker activating...');

    // Clean up old caches
    const cacheNames = await caches.keys();
    const cachesToDelete = cacheNames.filter(
      name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE
    );

    await Promise.all(
      cachesToDelete.map(name => caches.delete(name))
    );

    // Take control of all clients
    await self.clients.claim();
  }

  private async handleFetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle different types of requests
    if (this.isStaticFile(url)) {
      return this.cacheFirst(request, STATIC_CACHE);
    }

    if (this.isImage(url)) {
      return this.cacheFirst(request, DYNAMIC_CACHE);
    }

    if (this.isAPIRequest(url)) {
      return this.networkFirst(request, API_CACHE);
    }

    // Default to stale-while-revalidate for dynamic content
    return this.staleWhileRevalidate(request, DYNAMIC_CACHE);
  }

  private async cacheFirst(request: Request, cacheName: string): Promise<Response> {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        return cache.match('/offline.html') || new Response('Offline');
      }
      throw error;
    }
  }

  private async networkFirst(request: Request, cacheName: string): Promise<Response> {
    const cache = await caches.open(cacheName);

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  }

  private async staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Return cached response immediately if available
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });

    if (cachedResponse) {
      return cachedResponse;
    }

    return fetchPromise;
  }

  private isStaticFile(url: URL): boolean {
    return STATIC_FILES.includes(url.pathname) ||
           url.pathname.startsWith('/static/') ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.css');
  }

  private isImage(url: URL): boolean {
    return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  }

  private isAPIRequest(url: URL): boolean {
    return url.pathname.startsWith('/api/') ||
           API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint));
  }

  private async handleBackgroundSync(event: SyncEvent): Promise<void> {
    logger.info('Background sync triggered:', event.tag);

    switch (event.tag) {
      case 'sync-messages':
        await this.syncMessages();
        break;
      case 'sync-matches':
        await this.syncMatches();
        break;
      case 'sync-user-data':
        await this.syncUserData();
        break;
      default:
        logger.info('Unknown sync tag:', event.tag);
    }
  }

  private async syncMessages(): Promise<void> {
    try {
      // Get pending messages from IndexedDB
      const pendingMessages = await this.getPendingMessages();
      
      for (const message of pendingMessages) {
        await this.sendMessage(message);
        await this.removePendingMessage(message.id);
      }
    } catch (error) {
      logger.error('Failed to sync messages:', error);
    }
  }

  private async syncMatches(): Promise<void> {
    try {
      // Sync match data
      const response = await fetch('/api/matches/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastSync: await this.getLastSyncTime('matches'),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.updateMatches(data.matches);
        await this.setLastSyncTime('matches', Date.now());
      }
    } catch (error) {
      logger.error('Failed to sync matches:', error);
    }
  }

  private async syncUserData(): Promise<void> {
    try {
      // Sync user profile and preferences
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        await this.updateUserData(userData);
      }
    } catch (error) {
      logger.error('Failed to sync user data:', error);
    }
  }

  private async handlePushNotification(event: PushEvent): Promise<void> {
    logger.info('Push notification received:', event);

    const options = {
      body: event.data?.text() || 'You have a new notification!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      data: {
        url: '/matches',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/logo192.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    };

    const notification = await self.registration.showNotification(
      'Mingle',
      options
    );
  }

  private async handleNotificationClick(event: NotificationEvent): Promise<void> {
    event.notification.close();

    if (event.action === 'dismiss') {
      return;
    }

    // Focus existing window or open new one
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    const urlToOpen = event.notification.data?.url || '/';

    for (const client of clients) {
      if (client.url.includes(urlToOpen) && 'focus' in client) {
        return client.focus();
      }
    }

    if (self.clients.openWindow) {
      await self.clients.openWindow(urlToOpen);
    }
  }

  private async handleOnline(): Promise<void> {
    logger.info('App is online');
    
    // Trigger background sync for all pending syncs
    const registration = await self.registration;
    await registration.sync.register('sync-messages');
    await registration.sync.register('sync-matches');
    await registration.sync.register('sync-user-data');
  }

  private async handleOffline(): Promise<void> {
    logger.info('App is offline');
    
    // Show offline notification
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE_STATUS',
        isOnline: false,
      });
    });
  }

  // IndexedDB helpers
  private async getPendingMessages(): Promise<Array<{ id: string; content: string; timestamp: number }>> {
    // Implementation would use IndexedDB
    return [];
  }

  private async removePendingMessage(id: string): Promise<void> {
    // Implementation would use IndexedDB
  }

  private async getLastSyncTime(type: string): Promise<number> {
    // Implementation would use IndexedDB
    return 0;
  }

  private async setLastSyncTime(type: string, timestamp: number): Promise<void> {
    // Implementation would use IndexedDB
  }

  private async updateMatches(matches: Array<{ id: string; userId: string; matchedUserId: string; score: number }>): Promise<void> {
    // Implementation would use IndexedDB
  }

  private async updateUserData(userData: { id: string; name: string; preferences: Record<string, unknown> }): Promise<void> {
    // Implementation would use IndexedDB
  }

  private async sendMessage(message: { id: string; content: string; recipientId: string }): Promise<void> {
    // Implementation would send message to server
  }
}

// Initialize service worker
new AdvancedServiceWorker();

// Export for testing
export { AdvancedServiceWorker };
