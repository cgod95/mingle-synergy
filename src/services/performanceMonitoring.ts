// Performance monitoring service with real-time metrics and budget alerts

import logger from '@/utils/Logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'loading' | 'interaction' | 'network' | 'memory' | 'error';
}

export interface PerformanceBudget {
  name: string;
  threshold: number;
  unit: string;
  category: string;
  severity: 'warning' | 'error' | 'critical';
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'error' | 'critical';
  timestamp: number;
  message: string;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private budgets: PerformanceBudget[] = [];
  private alerts: PerformanceAlert[] = [];
  private timers: Map<string, number> = new Map();
  private readonly maxMetrics = 1000;
  private readonly maxAlerts = 100;

  constructor() {
    this.initializeBudgets();
    this.setupPerformanceObservers();
  }

  // Start a performance timer
  startTimer(name: string): string {
    const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, performance.now());
    return timerId;
  }

  // End a performance timer and record the metric
  endTimer(timerId: string): number {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      logger.warn(`Timer ${timerId} not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(timerId);

    this.recordMetric({
      name: timerId.split('_')[0],
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'loading'
    });

    return duration;
  }

  // Record a custom performance metric
  recordMetric(metric: Partial<PerformanceMetric>): void {
    const fullMetric: PerformanceMetric = {
      name: metric.name || 'unknown',
      value: metric.value || 0,
      unit: metric.unit || 'ms',
      category: metric.category || 'loading',
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    this.checkBudgets(fullMetric);
  }

  // Get performance metrics for a specific time range
  getMetrics(timeRange: 'hour' | 'day' | 'week' = 'hour', category?: string): PerformanceMetric[] {
    const now = Date.now();
    const timeRanges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - timeRanges[timeRange];
    let filteredMetrics = this.metrics.filter(metric => metric.timestamp >= cutoff);

    if (category) {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category);
    }

    return filteredMetrics;
  }

  // Get performance alerts
  getAlerts(timeRange: 'hour' | 'day' | 'week' = 'day'): PerformanceAlert[] {
    const now = Date.now();
    const timeRanges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - timeRanges[timeRange];
    return this.alerts.filter(alert => alert.timestamp >= cutoff);
  }

  // Get performance summary
  getPerformanceSummary(): {
    averageLoadTime: number;
    averageInteractionTime: number;
    errorRate: number;
    memoryUsage: number;
    activeAlerts: number;
  } {
    const recentMetrics = this.getMetrics('hour');
    const loadMetrics = recentMetrics.filter(m => m.category === 'loading');
    const interactionMetrics = recentMetrics.filter(m => m.category === 'interaction');
    const errorMetrics = recentMetrics.filter(m => m.category === 'error');
    const memoryMetrics = recentMetrics.filter(m => m.category === 'memory');

    return {
      averageLoadTime: loadMetrics.length > 0 
        ? loadMetrics.reduce((sum, m) => sum + m.value, 0) / loadMetrics.length 
        : 0,
      averageInteractionTime: interactionMetrics.length > 0 
        ? interactionMetrics.reduce((sum, m) => sum + m.value, 0) / interactionMetrics.length 
        : 0,
      errorRate: recentMetrics.length > 0 ? (errorMetrics.length / recentMetrics.length) * 100 : 0,
      memoryUsage: memoryMetrics.length > 0 
        ? memoryMetrics[memoryMetrics.length - 1].value 
        : 0,
      activeAlerts: this.alerts.filter(a => a.timestamp > Date.now() - 24 * 60 * 60 * 1000).length
    };
  }

  // Set up performance observers
  private setupPerformanceObservers(): void {
    // Navigation timing
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordMetric({
            name: 'page_load',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            unit: 'ms',
            category: 'loading'
          });

          this.recordMetric({
            name: 'dom_content_loaded',
            value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            unit: 'ms',
            category: 'loading'
          });
        }
      });
    }

    // Memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
        this.recordMetric({
          name: 'memory_usage',
          value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
          unit: 'MB',
          category: 'memory'
        });
      }, 30000); // Every 30 seconds
    }

    // Error tracking
    window.addEventListener('error', (event) => {
      this.recordMetric({
        name: 'javascript_error',
        value: 1,
        unit: 'count',
        category: 'error'
      });
    });

    // Network errors
    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric({
        name: 'unhandled_promise_rejection',
        value: 1,
        unit: 'count',
        category: 'error'
      });
    });
  }

  // Initialize default performance budgets
  private initializeBudgets(): void {
    this.budgets = [
      { name: 'page_load', threshold: 3000, unit: 'ms', category: 'loading', severity: 'warning' },
      { name: 'page_load', threshold: 5000, unit: 'ms', category: 'loading', severity: 'error' },
      { name: 'interaction', threshold: 100, unit: 'ms', category: 'interaction', severity: 'warning' },
      { name: 'interaction', threshold: 300, unit: 'ms', category: 'interaction', severity: 'error' },
      { name: 'memory_usage', threshold: 50, unit: 'MB', category: 'memory', severity: 'warning' },
      { name: 'memory_usage', threshold: 100, unit: 'MB', category: 'memory', severity: 'error' }
    ];
  }

  // Check if metrics exceed budgets
  private checkBudgets(metric: PerformanceMetric): void {
    const relevantBudgets = this.budgets.filter(budget => 
      budget.name === metric.name && budget.unit === metric.unit
    );

    for (const budget of relevantBudgets) {
      if (metric.value > budget.threshold) {
        this.createAlert(metric, budget);
      }
    }
  }

  // Create a performance alert
  private createAlert(metric: PerformanceMetric, budget: PerformanceBudget): void {
    const alert: PerformanceAlert = {
      id: `${metric.name}_${Date.now()}`,
      metric: metric.name,
      value: metric.value,
      threshold: budget.threshold,
      severity: budget.severity,
      timestamp: Date.now(),
      message: `${metric.name} exceeded ${budget.threshold}${budget.unit} (${metric.value}${metric.unit})`
    };

    this.alerts.push(alert);
    
    // Keep only the last maxAlerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    // Log alert
    logger.warn(`Performance Alert: ${alert.message}`);
  }

  // Clear old metrics and alerts
  clearOldData(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneWeekAgo);
    this.alerts = this.alerts.filter(alert => alert.timestamp > oneWeekAgo);
  }

  // Export performance data
  exportData(): string {
    return JSON.stringify({
      metrics: this.metrics,
      alerts: this.alerts,
      summary: this.getPerformanceSummary(),
      exportTime: new Date().toISOString()
    }, null, 2);
  }
}

// Create singleton instance
const performanceMonitoring = new PerformanceMonitoringService();

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  return {
    startTimer: performanceMonitoring.startTimer.bind(performanceMonitoring),
    endTimer: performanceMonitoring.endTimer.bind(performanceMonitoring),
    recordMetric: performanceMonitoring.recordMetric.bind(performanceMonitoring),
    getMetrics: performanceMonitoring.getMetrics.bind(performanceMonitoring),
    getAlerts: performanceMonitoring.getAlerts.bind(performanceMonitoring),
    getPerformanceSummary: performanceMonitoring.getPerformanceSummary.bind(performanceMonitoring),
    clearOldData: performanceMonitoring.clearOldData.bind(performanceMonitoring),
    exportData: performanceMonitoring.exportData.bind(performanceMonitoring)
  };
};

export default performanceMonitoring; 