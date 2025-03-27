
import { getPerformance, trace } from 'firebase/performance';
import { firestore as db } from '@/firebase/config';
import { logError } from './errorHandler';
import { analytics } from '@/firebase/config';
import { logEvent } from 'firebase/analytics';

// Interface for the non-standard Performance.memory API
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Extend Performance with memory property
interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

// Initialize Firebase Performance
let perf: ReturnType<typeof getPerformance> | null = null;

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    try {
      // Use dynamic import to prevent module initialization errors
      import('firebase/performance').then(({ getPerformance }) => {
        try {
          perf = getPerformance();
          console.log('Firebase Performance initialized');
        } catch (error) {
          console.warn('Firebase Performance initialization failed, continuing without performance monitoring');
        }
      }).catch(error => {
        console.warn('Failed to load Firebase Performance module:', error);
      });
    } catch (error) {
      logError(error as Error, { source: 'Performance initialization' });
    }
  }
};

// Custom trace for important user flows
export const startTrace = (traceName: string) => {
  if (!perf) return null;
  
  try {
    return trace(perf, traceName);
  } catch (error) {
    logError(error as Error, { source: 'Performance trace', traceName });
    return null;
  }
};

// Monitor Firebase read operations
export const monitorFirestoreReads = async <T>(
  queryPromise: Promise<T>,
  collectionName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    // Start trace
    const firestoreTrace = startTrace(`firestore_read_${collectionName}`);
    firestoreTrace?.start();
    
    // Execute query
    const result = await queryPromise;
    
    // End trace
    const duration = performance.now() - startTime;
    firestoreTrace?.putAttribute('collection', collectionName);
    firestoreTrace?.putMetric('duration_ms', duration);
    firestoreTrace?.stop();
    
    // Log slow queries (>500ms)
    if (duration > 500) {
      logEvent(analytics, 'slow_query', {
        collection: collectionName,
        duration_ms: duration
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logError(error as Error, { 
      source: 'Firestore read', 
      collection: collectionName,
      duration_ms: duration
    });
    throw error;
  }
};

// Monitor network requests
export const monitorNetworkRequest = async <T>(
  fetchPromise: Promise<T>,
  requestName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const networkTrace = startTrace(`network_${requestName}`);
    networkTrace?.start();
    
    const result = await fetchPromise;
    
    const duration = performance.now() - startTime;
    networkTrace?.putMetric('duration_ms', duration);
    networkTrace?.stop();
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logError(error as Error, { 
      source: 'Network request', 
      request: requestName,
      duration_ms: duration
    });
    throw error;
  }
};

// MemoryMonitor to detect memory leaks
export class MemoryMonitor {
  private samples: number[] = [];
  private intervalId: number | null = null;
  private readonly maxSamples = 20;
  
  start(intervalMs = 10000): void {
    if (typeof window === 'undefined') return;
    
    // Check if memory API is available
    const performanceWithMemory = performance as PerformanceWithMemory;
    if (!performanceWithMemory.memory) {
      console.warn('Performance.memory API is not available in this browser');
      return;
    }
    
    this.intervalId = window.setInterval(() => {
      this.takeSample();
      this.detectLeaks();
    }, intervalMs);
  }
  
  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  private takeSample(): void {
    const performanceWithMemory = performance as PerformanceWithMemory;
    if (performanceWithMemory.memory) {
      const usedHeap = performanceWithMemory.memory.usedJSHeapSize;
      this.samples.push(usedHeap);
      
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
    }
  }
  
  private detectLeaks(): void {
    if (this.samples.length < 5) return;
    
    const firstHalf = this.samples.slice(0, Math.floor(this.samples.length / 2));
    const secondHalf = this.samples.slice(Math.floor(this.samples.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    // If memory usage is consistently growing by more than 20%
    if (secondAvg > firstAvg * 1.2) {
      console.warn('Possible memory leak detected', {
        initial_avg_heap: firstAvg,
        current_avg_heap: secondAvg,
        increase_pct: ((secondAvg - firstAvg) / firstAvg) * 100
      });
      
      logEvent(analytics, 'possible_memory_leak', {
        initial_avg_heap: firstAvg,
        current_avg_heap: secondAvg,
        increase_pct: ((secondAvg - firstAvg) / firstAvg) * 100
      });
    }
  }
}

export default {
  initPerformanceMonitoring,
  startTrace,
  monitorFirestoreReads,
  monitorNetworkRequest,
  MemoryMonitor
};
