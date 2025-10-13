// Comprehensive advanced features service
import logger from '@/utils/Logger';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface RealTimeUpdate {
  type: 'match' | 'message' | 'venue' | 'user' | 'system';
  id: string;
  data: unknown;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
}

export interface SearchIndexResult {
  id: string;
  type: 'user' | 'venue' | 'message';
  title: string;
  description: string;
  relevance: number;
  metadata: Record<string, unknown>;
}

export interface SearchFilters {
  type?: 'user' | 'venue' | 'message';
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  minRelevance?: number;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  highlights: string[];
}

export interface SearchOptions {
  fuzzy?: boolean;
  caseSensitive?: boolean;
  limit?: number;
  filters?: Record<string, unknown>;
}

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  userId?: string;
}

class AdvancedFeaturesService {
  private pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  private notificationPermission: NotificationPermission = 'default';
  private realTimeConnections: Map<string, WebSocket> = new Map();
  private updateCallbacks: Map<string, Set<(update: RealTimeUpdate) => void>> = new Map();
  private searchIndex: Map<string, SearchIndexResult[]> = new Map();
  private webSocket: WebSocket | null = null;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor() {
    this.initializeNotifications();
    this.initializeRealTimeUpdates();
  }

  private async initializeNotifications(): Promise<void> {
    if (!this.pushSupported) {
      logger.warn('Push notifications not supported');
      return;
    }

    try {
      this.notificationPermission = await this.requestNotificationPermission();
    } catch (error) {
      logger.error('Failed to initialize notifications', error);
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission;
    } catch (error) {
      logger.error('Failed to request notification permission', error);
      return 'denied';
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        logger.warn('VAPID public key is not set. Push notifications will be disabled.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      logger.debug('Service worker registered', { registration });
    } catch (error) {
      logger.error('Failed to register service worker', error);
    }
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      // Skip in development mode
      if (import.meta.env.DEV) {
        logger.warn('Skipping push subscription in development mode');
        return null;
      }

      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        logger.warn('VAPID public key is missing or invalid. Push notifications will be disabled.');
        return null;
      }

      let vapidKeyArray: Uint8Array;
      try {
        vapidKeyArray = this.urlBase64ToUint8Array(vapidKey);
      } catch (err) {
        logger.warn('Failed to convert VAPID key to Uint8Array', err);
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyArray
      });

      logger.info('Push subscription created', { subscription });
      return subscription;
    } catch (error) {
      logger.error('Failed to subscribe to push notifications', error);
      return null;
    }
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.pushSupported) return false;

    try {
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (vapidKey) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          logger.info('Push subscription removed');
          return true;
        }
        
        return false;
      } else {
        logger.warn('VAPID public key is not set. Push notifications will be disabled.');
        return false;
      }
    } catch (error) {
      logger.error('Failed to unsubscribe from push notifications', error);
      return false;
    }
  }

  async sendLocalNotification(notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<string> {
    if (!this.pushSupported || this.notificationPermission !== 'granted') {
      return '';
    }

    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: PushNotification = {
      ...notification,
      id,
      timestamp: Date.now()
    };

    try {
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (vapidKey) {
        const registration = await navigator.serviceWorker.ready;
        const options: NotificationOptions = {
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          tag: notification.tag,
          data: notification.data,
          requireInteraction: notification.requireInteraction,
          silent: notification.silent
        };

        // Add actions if supported
        if (notification.actions && 'actions' in options) {
          (options as Record<string, unknown>).actions = notification.actions;
        }

        await registration.showNotification(notification.title, options);

        return id;
      } else {
        logger.warn('VAPID public key is not set. Push notifications will be disabled.');
        return '';
      }
    } catch (error) {
      logger.error('Failed to send local notification', error);
      return '';
    }
  }

  async scheduleNotification(
    notification: Omit<PushNotification, 'id' | 'timestamp'>,
    delay: number
  ): Promise<string> {
    const id = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setTimeout(async () => {
      await this.sendLocalNotification(notification);
    }, delay);

    return id;
  }

  // Real-time Updates
  private initializeRealTimeUpdates(): void {
    // Initialize WebSocket connections for different update types
    this.connectToRealTimeService('match');
    this.connectToRealTimeService('message');
    this.connectToRealTimeService('venue');
  }

  private connectToRealTimeService(type: string): void {
    if (this.realTimeConnections.has(type)) {
      return;
    }

    const wsUrlEnv = import.meta.env.VITE_WS_URL;
    if (!wsUrlEnv) {
      logger.warn('VITE_WS_URL is not set. Real-time features will be disabled.');
      return;
    }
    const wsUrl = `${wsUrlEnv}/realtime/${type}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      logger.debug(`Real-time connection established for ${type}`);
    };

    ws.onmessage = (event) => {
      try {
        const update: RealTimeUpdate = JSON.parse(event.data);
        this.handleRealTimeUpdate(update);
      } catch (error) {
        logger.error('Failed to parse real-time update', error);
      }
    };

    ws.onclose = () => {
      logger.debug(`Real-time connection closed for ${type}`);
      this.realTimeConnections.delete(type);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        this.connectToRealTimeService(type);
      }, 5000);
    };

    ws.onerror = (error) => {
      logger.error(`Real-time connection error for ${type}:`, error);
    };

    this.realTimeConnections.set(type, ws);
  }

  private handleRealTimeUpdate(update: RealTimeUpdate): void {
    // Notify all registered callbacks
    const callbacks = this.updateCallbacks.get(update.type) || new Set();
    callbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        logger.error('Error in real-time update callback', error);
      }
    });
  }

  subscribeToUpdates(type: string, callback: (update: RealTimeUpdate) => void): () => void {
    if (!this.updateCallbacks.has(type)) {
      this.updateCallbacks.set(type, new Set());
    }

    const callbacks = this.updateCallbacks.get(type)!;
    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.updateCallbacks.delete(type);
      }
    };
  }

  // Advanced Search
  async buildSearchIndex(): Promise<void> {
    // In a real app, this would fetch data from your backend
    // and build a search index (e.g., using Elasticsearch or similar)
    logger.debug('Building search index...');
    
    // Simulate building index
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Example index structure
    this.searchIndex.set('users', []);
    this.searchIndex.set('venues', []);
    this.searchIndex.set('messages', []);
  }

  async search(
    query: string,
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchIndexResult[]> {
    if (!query.trim()) {
      return [];
    }

    // In a real app, this would use a proper search engine
    // For now, we'll simulate search results
    const results: SearchIndexResult[] = [];
    const searchTypes = filters.type ? [filters.type] : ['user', 'venue', 'message'];

    for (const type of searchTypes) {
      const typeResults = await this.searchByType(query, type, filters, limit);
      results.push(...typeResults);
    }

    // Sort by relevance and apply limit
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  private async searchByType(
    query: string,
    type: string,
    filters: SearchFilters,
    limit: number
  ): Promise<SearchIndexResult[]> {
    try {
      // In a real implementation, this would query a search index
      // For now, we'll return an empty array as this is not implemented
      logger.info('Search by type called:', { query, type, filters, limit });
      
      // TODO: Implement real search functionality
      // This would typically involve:
      // 1. Querying a search index (Algolia, Elasticsearch, etc.)
      // 2. Applying filters and sorting
      // 3. Returning paginated results
      
      return [];
    } catch (error) {
      logger.error('Error searching by type:', error);
      throw new Error('Failed to search by type');
    }
  }

  /**
   * Search for users with advanced filters
   */
  async searchUsers(filters: SearchFilters): Promise<SearchIndexResult[]> {
    try {
      // In a real implementation, this would query a search index
      // For now, we'll return an empty array as this is not implemented
      logger.info('Search users called with filters:', filters);
      
      // TODO: Implement real search functionality
      // This would typically involve:
      // 1. Querying a search index (Algolia, Elasticsearch, etc.)
      // 2. Applying filters and sorting
      // 3. Returning paginated results
      
      return [];
    } catch (error) {
      logger.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  // Advanced Search Features
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) return [];

    // In a real app, this would use autocomplete/typeahead functionality
    const suggestions = [
      `${query} user`,
      `${query} venue`,
      `${query} nearby`,
      `${query} today`,
      `${query} popular`
    ];

    return suggestions.slice(0, limit);
  }

  async getSearchHistory(): Promise<string[]> {
    // In a real app, this would fetch from localStorage or backend
    const history = localStorage.getItem('search_history');
    return history ? JSON.parse(history) : [];
  }

  async saveSearchQuery(query: string): Promise<void> {
    const history = await this.getSearchHistory();
    const newHistory = [query, ...history.filter(q => q !== query)].slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  }

  async getPopularSearches(): Promise<string[]> {
    // In a real app, this would fetch from analytics/backend
    return [
      'coffee shops',
      'restaurants',
      'bars',
      'parks',
      'gyms'
    ];
  }

  // Utility Functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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

  // Service Status
  isPushSupported(): boolean {
    return this.pushSupported;
  }

  getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }

  isRealTimeConnected(type: string): boolean {
    const connection = this.realTimeConnections.get(type);
    return connection?.readyState === WebSocket.OPEN;
  }

  // Cleanup
  disconnect(): void {
    // Close all WebSocket connections
    for (const [type, ws] of this.realTimeConnections.entries()) {
      ws.close();
      this.realTimeConnections.delete(type);
    }

    // Clear all callbacks
    this.updateCallbacks.clear();
  }

  // Advanced search functionality
  async searchVenues<T>(query: string, venues: T[], options: SearchOptions = {}): Promise<T[]> {
    if (!query.trim()) return venues;

    const {
      fuzzy = true,
      caseSensitive = false,
      limit = 10,
      filters = {}
    } = options;

    const searchQuery = caseSensitive ? query : query.toLowerCase();
    const results: SearchResult<T>[] = [];

    for (const venue of venues) {
      const venueStr = JSON.stringify(venue);
      const searchStr = caseSensitive ? venueStr : venueStr.toLowerCase();
      
      let score = 0;
      const highlights: string[] = [];

      if (fuzzy) {
        // Simple fuzzy search - check if query terms appear in venue data
        const queryTerms = searchQuery.split(' ');
        for (const term of queryTerms) {
          if (searchStr.includes(term)) {
            score += 1;
            highlights.push(term);
          }
        }
      } else {
        // Exact match
        if (searchStr.includes(searchQuery)) {
          score = 1;
          highlights.push(searchQuery);
        }
      }

      // Apply filters
      let passesFilters = true;
      for (const [key, value] of Object.entries(filters)) {
        if (value && (venue as Record<string, unknown>)[key] !== value) {
          passesFilters = false;
          break;
        }
      }

      if (score > 0 && passesFilters) {
        results.push({ item: venue, score, highlights });
      }
    }

    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.item);
  }

  // WebSocket real-time updates
  connectWebSocket(url: string): void {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.webSocket = new WebSocket(url);
      
      this.webSocket.onopen = () => {
        logger.debug('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.webSocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error);
        }
      };

      this.webSocket.onclose = () => {
        logger.debug('WebSocket disconnected');
        this.attemptReconnect(url);
      };

      this.webSocket.onerror = (error) => {
        logger.error('WebSocket error:', error);
      };

    } catch (error) {
      logger.error('Failed to connect WebSocket', error);
    }
  }

  disconnectWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
  }

  sendWebSocketMessage(type: string, payload: unknown): void {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now()
      };
      this.webSocket.send(JSON.stringify(message));
    } else {
      logger.warn('WebSocket not connected');
    }
  }

  onWebSocketMessage(type: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  offWebSocketMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  // Real-time venue updates
  subscribeToVenueUpdates(venueId: string): void {
    this.sendWebSocketMessage('subscribe_venue', { venueId });
  }

  unsubscribeFromVenueUpdates(venueId: string): void {
    this.sendWebSocketMessage('unsubscribe_venue', { venueId });
  }

  // Real-time match updates
  subscribeToMatchUpdates(matchId: string): void {
    this.sendWebSocketMessage('subscribe_match', { matchId });
  }

  unsubscribeFromMatchUpdates(matchId: string): void {
    this.sendWebSocketMessage('unsubscribe_match', { matchId });
  }

  // Advanced filtering
  filterVenues<T>(
    venues: T[],
    filters: Record<string, unknown>
  ): T[] {
    return venues.filter(venue => {
      for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null) continue;
        
        const venueValue = (venue as Record<string, unknown>)[key];
        
        if (Array.isArray(value)) {
          if (!Array.isArray(venueValue) || !value.some(v => venueValue.includes(v))) {
            return false;
          }
        } else if (typeof value === 'object') {
          // Range filter
          if (typeof venueValue === 'number' && typeof value === 'object') {
            const range = value as { min?: number; max?: number };
            if (range.min !== undefined && venueValue < range.min) return false;
            if (range.max !== undefined && venueValue > range.max) return false;
          }
        } else {
          if (venueValue !== value) {
            return false;
          }
        }
      }
      return true;
    });
  }

  // Sort venues by various criteria
  sortVenues<T>(
    venues: T[],
    sortBy: string,
    direction: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...venues].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortBy];
      const bValue = (b as Record<string, unknown>)[sortBy];

      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  // Utility methods
  private handleWebSocketMessage(message: WebSocketMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff

    setTimeout(() => {
      logger.debug(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connectWebSocket(url);
    }, delay);
  }

  // Get service status
  getStatus(): {
    notificationsEnabled: boolean;
    webSocketConnected: boolean;
    searchIndexSize: number;
  } {
    return {
      notificationsEnabled: this.notificationPermission === 'granted',
      webSocketConnected: this.webSocket?.readyState === WebSocket.OPEN,
      searchIndexSize: this.searchIndex.size
    };
  }

  // Cleanup
  cleanup(): void {
    this.disconnectWebSocket();
    this.messageHandlers.clear();
    this.searchIndex.clear();
  }
}

// Export singleton instance
export const advancedFeatures = new AdvancedFeaturesService();

// Auto-initialize search index
advancedFeatures.buildSearchIndex().catch(console.error);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  advancedFeatures.disconnect();
}); 