import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  enableLogging?: boolean;
}

class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly enableLogging: boolean;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100;
    this.enableLogging = options.enableLogging || false;
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.ttl;
    const timestamp = Date.now();

    // Remove expired entries before adding new one
    this.cleanup();

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      if (this.enableLogging) {
        console.log(`Cache: Removed oldest entry ${oldestKey} due to size limit`);
      }
    }

    this.cache.set(key, { data, timestamp, ttl });
    
    if (this.enableLogging) {
      console.log(`Cache: Set ${key} with TTL ${ttl}ms`);
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.enableLogging) {
        console.log(`Cache: Miss for ${key}`);
      }
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      if (this.enableLogging) {
        console.log(`Cache: Expired entry ${key}`);
      }
      return null;
    }

    if (this.enableLogging) {
      console.log(`Cache: Hit for ${key}`);
    }
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (this.enableLogging && deleted) {
      console.log(`Cache: Manually deleted ${key}`);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    if (this.enableLogging) {
      console.log('Cache: Cleared all entries');
    }
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        if (this.enableLogging) {
          console.log(`Cache: Cleaned up expired entry ${key}`);
        }
      }
    }
  }

  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instances
const caches = new Map<string, Cache<unknown>>();

function getCache<T>(name: string, options?: CacheOptions): Cache<T> {
  if (!caches.has(name)) {
    caches.set(name, new Cache<T>(options));
  }
  return caches.get(name) as Cache<T>;
}

// Hook for using cache with React state
export function useCache<T>(
  cacheName: string,
  options?: CacheOptions
) {
  const cacheRef = useRef<Cache<T>>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    cacheRef.current = getCache<T>(cacheName, options);
    setIsInitialized(true);
  }, [cacheName, options]);

  const set = useCallback((key: string, data: T, customTtl?: number) => {
    cacheRef.current?.set(key, data, customTtl);
  }, []);

  const get = useCallback((key: string): T | null => {
    return cacheRef.current?.get(key) || null;
  }, []);

  const has = useCallback((key: string): boolean => {
    return cacheRef.current?.has(key) || false;
  }, []);

  const deleteKey = useCallback((key: string): boolean => {
    return cacheRef.current?.delete(key) || false;
  }, []);

  const clear = useCallback(() => {
    cacheRef.current?.clear();
  }, []);

  const getStats = useCallback(() => {
    return cacheRef.current?.getStats();
  }, []);

  return {
    set,
    get,
    has,
    delete: deleteKey,
    clear,
    getStats,
    isInitialized,
  };
}

// Hook for cached API calls
export function useCachedQuery<T>(
  cacheName: string,
  queryFn: () => Promise<T>,
  key: string,
  options?: CacheOptions & {
    enabled?: boolean;
    refetchOnMount?: boolean;
  }
) {
  const cache = useCache<T>(cacheName, options);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!cache.isInitialized) return;

    // Check cache first
    const cachedData = cache.get(key);
    if (cachedData && !force) {
      setData(cachedData);
      return cachedData;
    }

    // Fetch from API
    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      cache.set(key, result);
      setData(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Query failed');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [cache, key, queryFn]);

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchData(options?.refetchOnMount);
    }
  }, [fetchData, options?.enabled, options?.refetchOnMount]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    setData(null);
  }, [cache, key]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isCached: cache.has(key),
  };
}

// Hook for optimistic cache updates
export function useOptimisticCache<T>(
  cacheName: string,
  options?: CacheOptions
) {
  const cache = useCache<T>(cacheName, options);
  const [optimisticData, setOptimisticData] = useState<Map<string, T>>(new Map());

  const setOptimistically = useCallback((key: string, data: T) => {
    setOptimisticData(prev => new Map(prev).set(key, data));
  }, []);

  const commitOptimistic = useCallback((key: string, ttl?: number) => {
    const data = optimisticData.get(key);
    if (data) {
      cache.set(key, data, ttl);
      setOptimisticData(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  }, [cache, optimisticData]);

  const rollbackOptimistic = useCallback((key: string) => {
    setOptimisticData(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const get = useCallback((key: string): T | null => {
    // Return optimistic data if available, otherwise cached data
    return optimisticData.get(key) || cache.get(key);
  }, [cache, optimisticData]);

  return {
    get,
    setOptimistically,
    commitOptimistic,
    rollbackOptimistic,
    hasOptimisticData: (key: string) => optimisticData.has(key),
  };
}

// Cache management utilities
export const cacheManager = {
  clearAll: () => {
    caches.forEach(cache => cache.clear());
  },
  
  getStats: () => {
    const stats: Record<string, ReturnType<Cache<unknown>['getStats']>> = {};
    caches.forEach((cache, name) => {
      stats[name] = cache.getStats();
    });
    return stats;
  },
  
  clearCache: (name: string) => {
    caches.get(name)?.clear();
  },
  
  getCacheNames: () => Array.from(caches.keys()),
}; 