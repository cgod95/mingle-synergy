import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  Download, 
  Wifi, 
  WifiOff, 
  Zap, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Badge,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';

// Lazy loaded component wrapper with intersection observer
export const LazyComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}> = ({ 
  children, 
  fallback = <div className="h-32 bg-muted animate-pulse rounded" />,
  threshold = 0.1,
  rootMargin = "50px"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Image optimization component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = "",
  priority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Image failed to load</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  memoryUsage?: number;
  networkRequests: number;
  errors: number;
  warnings: number;
}

interface PerformanceProps {
  showDetails?: boolean;
  onRefresh?: () => void;
}

const Performance: React.FC<PerformanceProps> = ({ 
  showDetails = false, 
  onRefresh 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<PerformanceObserver | null>(null);

  const getPerformanceMetrics = (): PerformanceMetrics => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');
      
      const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const largestContentfulPaint = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
      
      // Calculate cumulative layout shift
      let cumulativeLayoutShift = 0;
      if ('PerformanceObserver' in window) {
        // This would be calculated by a LayoutShift observer
        cumulativeLayoutShift = 0;
      }

      // Calculate first input delay
      let firstInputDelay = 0;
      if ('PerformanceObserver' in window) {
        // This would be calculated by a FirstInput observer
        firstInputDelay = 0;
      }

      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint,
        largestContentfulPaint,
        cumulativeLayoutShift,
        firstInputDelay,
        timeToInteractive: navigation.domInteractive - navigation.fetchStart,
        memoryUsage: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize,
        networkRequests: resources.length,
        errors: 0, // Would be tracked separately
        warnings: 0 // Would be tracked separately
      };
    } catch (err) {
      throw new Error('Failed to get performance metrics');
    }
  };

  const getPerformanceScore = (metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // Deduct points for slow load times
    if (metrics.loadTime > 3000) score -= 20;
    else if (metrics.loadTime > 2000) score -= 10;
    else if (metrics.loadTime > 1000) score -= 5;
    
    // Deduct points for slow FCP
    if (metrics.firstContentfulPaint > 2000) score -= 20;
    else if (metrics.firstContentfulPaint > 1500) score -= 10;
    else if (metrics.firstContentfulPaint > 1000) score -= 5;
    
    // Deduct points for slow LCP
    if (metrics.largestContentfulPaint > 4000) score -= 20;
    else if (metrics.largestContentfulPaint > 2500) score -= 10;
    else if (metrics.largestContentfulPaint > 1500) score -= 5;
    
    // Deduct points for poor CLS
    if (metrics.cumulativeLayoutShift > 0.25) score -= 20;
    else if (metrics.cumulativeLayoutShift > 0.1) score -= 10;
    else if (metrics.cumulativeLayoutShift > 0.05) score -= 5;
    
    // Deduct points for slow FID
    if (metrics.firstInputDelay > 300) score -= 20;
    else if (metrics.firstInputDelay > 100) score -= 10;
    else if (metrics.firstInputDelay > 50) score -= 5;
    
    return Math.max(0, score);
  };

  const getPerformanceStatus = (score: number): {
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    color: string;
    icon: React.ReactNode;
  } => {
    if (score >= 90) {
      return {
        status: 'excellent',
        color: 'text-green-600',
        icon: <CheckCircle className="w-4 h-4" />
      };
    } else if (score >= 70) {
      return {
        status: 'good',
        color: 'text-blue-600',
        icon: <TrendingUp className="w-4 h-4" />
      };
    } else if (score >= 50) {
      return {
        status: 'needs-improvement',
        color: 'text-yellow-600',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else {
      return {
        status: 'poor',
        color: 'text-red-600',
        icon: <X className="w-4 h-4" />
      };
    }
  };

  useEffect(() => {
    const measurePerformance = () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Wait for page to fully load
        setTimeout(() => {
          const metrics = getPerformanceMetrics();
          setMetrics(metrics);
          setIsLoading(false);
        }, 100);
      } catch (err) {
        setError('Failed to measure performance');
        setIsLoading(false);
      }
    };

    measurePerformance();

    // Set up performance observer for real-time monitoring
    if ('PerformanceObserver' in window) {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          // Handle real-time performance updates
        });
        
        observerRef.current.observe({ entryTypes: ['navigation', 'paint', 'resource'] });
      } catch (err) {
        console.warn('PerformanceObserver not supported');
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Measuring performance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <X className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const score = getPerformanceScore(metrics);
  const status = getPerformanceStatus(score);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Performance</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={status.status === 'excellent' ? 'default' : 'secondary'}>
              {score}/100
            </Badge>
            <span className={status.color}>{status.icon}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Load Time</span>
              <span className="font-mono">{metrics.loadTime.toFixed(0)}ms</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((metrics.loadTime / 3000) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>FCP</span>
              <span className="font-mono">{metrics.firstContentfulPaint.toFixed(0)}ms</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((metrics.firstContentfulPaint / 2000) * 100, 100)}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">LCP:</span>
                <span className="font-mono ml-2">{metrics.largestContentfulPaint.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="text-gray-600">CLS:</span>
                <span className="font-mono ml-2">{metrics.cumulativeLayoutShift.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-gray-600">FID:</span>
                <span className="font-mono ml-2">{metrics.firstInputDelay.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="text-gray-600">TTI:</span>
                <span className="font-mono ml-2">{metrics.timeToInteractive.toFixed(0)}ms</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Network Requests:</span>
                <span className="font-mono ml-2">{metrics.networkRequests}</span>
              </div>
              {metrics.memoryUsage && (
                <div>
                  <span className="text-gray-600">Memory:</span>
                  <span className="font-mono ml-2">{(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
                </div>
              )}
            </div>
          </div>
        )}

        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Metrics
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Performance;

// Network status indicator
export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as Navigator & { connection: { effectiveType: string } }).connection;
      setConnectionType(connection.effectiveType || 'unknown');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">
          You're offline. Some features may not work.
        </span>
      </div>
    </div>
  );
};

// Bundle size analyzer (development only)
export const BundleAnalyzer: React.FC = () => {
  const [bundleInfo, setBundleInfo] = useState<{
    totalSize: string;
    chunks: number;
    modules: number;
  } | null>(null);

  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      // This would integrate with webpack-bundle-analyzer or similar
      // For now, we'll show a placeholder
      setBundleInfo({
        totalSize: '2.1 MB',
        chunks: 5,
        modules: 2945
      });
    }
  }, []);

  if (import.meta.env.MODE !== 'development' || !bundleInfo) return null;

  return (
    <Card className="fixed top-4 left-4 w-64 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Bundle Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Total Size:</span>
          <span>{bundleInfo.totalSize}</span>
        </div>
        <div className="flex justify-between">
          <span>Chunks:</span>
          <span>{bundleInfo.chunks}</span>
        </div>
        <div className="flex justify-between">
          <span>Modules:</span>
          <span>{bundleInfo.modules}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Memory usage monitor
export const MemoryMonitor: React.FC = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!memoryInfo) return null;

  const usagePercentage = (memoryInfo.used / memoryInfo.limit) * 100;

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
      <div className="flex items-center space-x-2">
        <span>Memory:</span>
        <span className={usagePercentage > 80 ? 'text-red-400' : 'text-green-400'}>
          {memoryInfo.used}MB / {memoryInfo.limit}MB
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
        <div 
          className={`h-1 rounded-full ${
            usagePercentage > 80 ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${usagePercentage}%` }}
        />
      </div>
    </div>
  );
};

// Preload critical resources
export const PreloadResources: React.FC = () => {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/logo192.png',
      '/logo512.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/ginto-normal.woff2',
      '/fonts/ginto-normal-medium.woff2',
      '/fonts/ginto-normal-bold.woff2'
    ];

    criticalFonts.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return null;
};

// Lazy load routes
export const LazyRoute: React.FC<{
  component: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;
  fallback?: React.ReactNode;
}> = ({ component, fallback = <div className="h-screen bg-gray-100 animate-pulse" /> }) => {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
}; 