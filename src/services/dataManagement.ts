// Comprehensive data management service with caching, optimistic updates, and offline handling

import logger from '@/utils/Logger';

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version: string;
  etag?: string;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  version: string;
  enableCompression: boolean;
}

export interface OptimisticUpdate<T = unknown> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  timestamp: number;
  rollbackData?: T;
  status: 'pending' | 'success' | 'failed';
  retryCount: number;
}

export interface OfflineQueueItem {
  id: string;
  action: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  pendingChanges: number;
  syncInProgress: boolean;
  error?: string;
}

class DataManagementService {
  private cache = new Map<string, CacheEntry>();
  private optimisticUpdates = new Map<string, OptimisticUpdate<unknown>>();
  private offlineQueue: OfflineQueueItem[] = [];
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: Date.now(),
    pendingChanges: 0,
    syncInProgress: false
  };

  private readonly cacheConfig: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    version: '1.0.0',
    enableCompression: true
  };

  constructor() {
    this.initializeOfflineHandling();
    this.loadFromStorage();
  }

  // Cache Management
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.cacheConfig.defaultTTL,
      version: this.cacheConfig.version
    };

    // Check cache size limit
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Check version compatibility
    if (entry.version !== this.cacheConfig.version) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  private isExpired(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Optimistic Updates
  applyOptimisticUpdate<T>(
    id: string,
    type: 'create' | 'update' | 'delete',
    data: T,
    rollbackData?: T
  ): void {
    const update: OptimisticUpdate<T> = {
      id,
      type,
      data,
      timestamp: Date.now(),
      rollbackData,
      status: 'pending',
      retryCount: 0
    };

    this.optimisticUpdates.set(id, update);
    this.updateSyncStatus();
  }

  commitOptimisticUpdate(id: string): void {
    this.optimisticUpdates.delete(id);
    this.updateSyncStatus();
  }

  rollbackOptimisticUpdate<T>(id: string): T | null {
    const update = this.optimisticUpdates.get(id);
    if (!update) return null;

    this.optimisticUpdates.delete(id);
    this.updateSyncStatus();
    return (update.rollbackData as T) || null;
  }

  getOptimisticUpdates(): OptimisticUpdate<unknown>[] {
    return Array.from(this.optimisticUpdates.values());
  }

  // Offline Queue Management
  addToOfflineQueue(action: string, payload: unknown, maxRetries: number = 3): string {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queueItem: OfflineQueueItem = {
      id,
      action,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.offlineQueue.push(queueItem);
    this.updateSyncStatus();
    this.saveToStorage();
    
    return id;
  }

  removeFromOfflineQueue(id: string): boolean {
    const index = this.offlineQueue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.offlineQueue.splice(index, 1);
      this.updateSyncStatus();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getOfflineQueue(): OfflineQueueItem[] {
    return [...this.offlineQueue];
  }

  retryOfflineQueueItem(id: string): boolean {
    const item = this.offlineQueue.find(item => item.id === id);
    if (!item || item.retryCount >= item.maxRetries) {
      return false;
    }

    item.retryCount++;
    this.saveToStorage();
    return true;
  }

  // Sync Management
  async syncOfflineQueue(): Promise<void> {
    if (this.syncStatus.syncInProgress || !this.syncStatus.isOnline) {
      return;
    }

    this.syncStatus.syncInProgress = true;
    this.updateSyncStatus();

    try {
      const queue = [...this.offlineQueue];
      
      for (const item of queue) {
        try {
          await this.processOfflineQueueItem(item);
          this.removeFromOfflineQueue(item.id);
        } catch (error) {
          logger.error(`Failed to process offline queue item ${item.id}:`, error);
          
          if (item.retryCount >= item.maxRetries) {
            // Remove permanently failed items
            this.removeFromOfflineQueue(item.id);
          }
        }
      }

      this.syncStatus.lastSync = Date.now();
    } catch (error) {
      this.syncStatus.error = error instanceof Error ? error.message : 'Sync failed';
    } finally {
      this.syncStatus.syncInProgress = false;
      this.updateSyncStatus();
    }
  }

  private async processOfflineQueueItem(item: OfflineQueueItem): Promise<void> {
    // In a real app, this would make the actual API call
    // For now, we'll simulate the processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate potential failure
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('Simulated API failure');
    }
  }

  // Network Status Management
  private initializeOfflineHandling(): void {
    const handleOnline = () => {
      this.syncStatus.isOnline = true;
      this.syncStatus.error = undefined;
      this.updateSyncStatus();
      this.syncOfflineQueue();
    };

    const handleOffline = () => {
      this.syncStatus.isOnline = false;
      this.updateSyncStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  }

  private updateSyncStatus(): void {
    this.syncStatus.pendingChanges = this.optimisticUpdates.size + this.offlineQueue.length;
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Storage Management
  private saveToStorage(): void {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        offlineQueue: this.offlineQueue,
        timestamp: Date.now()
      };

      localStorage.setItem('mingle_data_cache', JSON.stringify(data));
    } catch (error) {
      logger.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('mingle_data_cache');
      if (!stored) return;

      const data = JSON.parse(stored);
      
      // Load cache
      if (data.cache && Array.isArray(data.cache)) {
        this.cache = new Map(data.cache);
      }

      // Load offline queue
      if (data.offlineQueue && Array.isArray(data.offlineQueue)) {
        this.offlineQueue = data.offlineQueue;
      }

      this.updateSyncStatus();
    } catch (error) {
      logger.warn('Failed to load cache from localStorage:', error);
    }
  }

  // Cache Statistics
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
    evictions: number;
  } {
    // In a real implementation, you'd track these metrics
    return {
      size: this.cache.size,
      maxSize: this.cacheConfig.maxSize,
      hitRate: 0.85, // Placeholder
      missRate: 0.15, // Placeholder
      evictions: 0 // Placeholder
    };
  }

  // Cache Warming
  async warmCache(keys: string[], fetcher: (key: string) => Promise<unknown>): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const data = await fetcher(key);
          this.set(key, data);
        } catch (error) {
          logger.warn(`Failed to warm cache for key ${key}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  // Cache Invalidation
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    if (invalidated > 0) {
      this.saveToStorage();
    }

    return invalidated;
  }

  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // In a real implementation, you'd store tags with cache entries
      // For now, we'll check if the key contains any of the tags
      if (tags.some(tag => key.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    if (invalidated > 0) {
      this.saveToStorage();
    }

    return invalidated;
  }

  // Data Compression (simplified)
  private compress(data: unknown): string {
    if (this.cacheConfig.enableCompression) {
      // In a real implementation, you'd use a compression library
      return JSON.stringify(data);
    }
    return JSON.stringify(data);
  }

  private decompress(data: string): unknown {
    if (this.cacheConfig.enableCompression) {
      // In a real implementation, you'd decompress the data
      return JSON.parse(data);
    }
    return JSON.parse(data);
  }

  // Export/Import
  exportData(): string {
    const data = {
      cache: Array.from(this.cache.entries()),
      offlineQueue: this.offlineQueue,
      optimisticUpdates: Array.from(this.optimisticUpdates.entries()),
      syncStatus: this.syncStatus,
      config: this.cacheConfig,
      timestamp: Date.now()
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.cache) {
        this.cache = new Map(data.cache);
      }
      
      if (data.offlineQueue) {
        this.offlineQueue = data.offlineQueue;
      }
      
      if (data.optimisticUpdates) {
        this.optimisticUpdates = new Map(data.optimisticUpdates);
      }
      
      if (data.syncStatus) {
        this.syncStatus = { ...this.syncStatus, ...data.syncStatus };
      }

      this.updateSyncStatus();
      this.saveToStorage();
      
      return true;
    } catch (error) {
      logger.error('Failed to import data:', error);
      return false;
    }
  }

  // Cleanup
  cleanup(): void {
    // Remove expired cache entries
    for (const [key] of this.cache.entries()) {
      if (this.isExpired(key)) {
        this.cache.delete(key);
      }
    }

    // Remove old offline queue items (older than 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.offlineQueue = this.offlineQueue.filter(item => item.timestamp > sevenDaysAgo);

    this.saveToStorage();
    this.updateSyncStatus();
  }
}

// Export singleton instance
export const dataManagement = new DataManagementService();

// Auto-cleanup every hour
setInterval(() => {
  dataManagement.cleanup();
}, 60 * 60 * 1000); 