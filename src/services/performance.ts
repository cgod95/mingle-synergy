// Comprehensive performance monitoring service

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'navigation' | 'resource' | 'paint' | 'layout' | 'memory' | 'custom';
  metadata?: Record<string, unknown>;
}

export interface PerformanceBudget {
  metric: string;
  threshold: number;
  unit: string;
  severity: 'warning' | 'error';
  description: string;
}

export interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetric[];
  violations: PerformanceBudget[];
  recommendations: string[];
  score: number; // 0-100
}

export interface ResourceTiming {
  name: string;
  initiatorType: string;
  duration: number;
  size: number;
  startTime: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private budgets: PerformanceBudget[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private intervals: Set<number> = new Set(); // Track all intervals for cleanup
  private isMonitoring = false;

  constructor() {
    this.initializeBudgets();
  }

  // Initialize default performance budgets
  private initializeBudgets(): void {
    this.budgets = [
      {
        metric: 'First Contentful Paint',
        threshold: 1800,
        unit: 'ms',
        severity: 'warning',
        description: 'Should be under 1.8 seconds'
      },
      {
        metric: 'Largest Contentful Paint',
        threshold: 2500,
        unit: 'ms',
        severity: 'error',
        description: 'Should be under 2.5 seconds'
      },
      {
        metric: 'First Input Delay',
        threshold: 100,
        unit: 'ms',
        severity: 'warning',
        description: 'Should be under 100ms'
      },
      {
        metric: 'Cumulative Layout Shift',
        threshold: 0.1,
        unit: '',
        severity: 'error',
        description: 'Should be under 0.1'
      },
      {
        metric: 'Total Blocking Time',
        threshold: 300,
        unit: 'ms',
        severity: 'warning',
        description: 'Should be under 300ms'
      }
    ];
  }

  // Start monitoring
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.observeNavigationTiming();
    this.observeResourceTiming();
    this.observePaintTiming();
    this.observeLayoutShifts();
    this.observeLongTasks();
    this.observeMemoryUsage();
    this.observeCustomMetrics();

    console.log('Performance monitoring started');
  }

  // Stop monitoring
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    // Clear all intervals
    for (const intervalId of this.intervals) {
      clearInterval(intervalId);
    }
    this.intervals.clear();
    
    // Disconnect all observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();

    console.log('Performance monitoring stopped');
  }

  // Navigation Timing
  private observeNavigationTiming(): void {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    // Record navigation metrics
    this.recordMetric('DOM Content Loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms', 'navigation');
    this.recordMetric('Load Complete', navigation.loadEventEnd - navigation.loadEventStart, 'ms', 'navigation');
    this.recordMetric('First Byte', navigation.responseStart - navigation.requestStart, 'ms', 'navigation');
    this.recordMetric('DNS Lookup', navigation.domainLookupEnd - navigation.domainLookupStart, 'ms', 'navigation');
    this.recordMetric('TCP Connection', navigation.connectEnd - navigation.connectStart, 'ms', 'navigation');
    this.recordMetric('Server Response', navigation.responseEnd - navigation.responseStart, 'ms', 'navigation');
  }

  // Resource Timing
  private observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        this.recordMetric(
          `Resource: ${resourceEntry.name}`,
          resourceEntry.duration,
          'ms',
          'resource',
          {
            initiatorType: resourceEntry.initiatorType,
            size: resourceEntry.transferSize,
            domain: new URL(resourceEntry.name).hostname
          }
        );
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  // Paint Timing
  private observePaintTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const paintEntry = entry as PerformancePaintTiming;
        this.recordMetric(
          paintEntry.name,
          paintEntry.startTime,
          'ms',
          'paint'
        );
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.set('paint', observer);
  }

  // Layout Shifts
  private observeLayoutShifts(): void {
    if (!('PerformanceObserver' in window)) return;

    let cumulativeLayoutShift = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as unknown as { hadRecentInput: boolean; value: number };
        if (!layoutEntry.hadRecentInput) {
          cumulativeLayoutShift += layoutEntry.value;
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('layout-shift', observer);

    // Record cumulative layout shift periodically
    // FIX: Store interval ID for cleanup to prevent 5-second re-renders
    const layoutShiftInterval = window.setInterval(() => {
      this.recordMetric('Cumulative Layout Shift', cumulativeLayoutShift, '', 'layout');
    }, 5000);
    this.intervals.add(layoutShiftInterval);
  }

  // Long Tasks
  private observeLongTasks(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const longTaskEntry = entry as unknown as { duration: number; startTime: number; name: string };
        this.recordMetric(
          'Long Task',
          longTaskEntry.duration,
          'ms',
          'custom',
          {
            startTime: longTaskEntry.startTime,
            name: longTaskEntry.name
          }
        );
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.set('longtask', observer);
  }

  // Memory Usage
  private observeMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const recordMemory = () => {
      const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memory) {
        this.recordMetric('Memory Used', memory.usedJSHeapSize, 'bytes', 'memory');
        this.recordMetric('Memory Total', memory.totalJSHeapSize, 'bytes', 'memory');
        this.recordMetric('Memory Limit', memory.jsHeapSizeLimit, 'bytes', 'memory');
      }
    };

    // Record memory usage every 10 seconds
    // FIX: Store interval ID for cleanup
    const memoryInterval = window.setInterval(recordMemory, 10000);
    this.intervals.add(memoryInterval);
    recordMemory(); // Initial recording
  }

  // Custom Metrics
  private observeCustomMetrics(): void {
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrames = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount / ((currentTime - lastTime) / 1000);
        this.recordMetric('FPS', fps, 'fps', 'custom');
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };

    requestAnimationFrame(countFrames);
  }

  // Record a custom metric
  recordMetric(
    name: string,
    value: number,
    unit: string,
    category: PerformanceMetric['category'],
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      category
    };
    if (metadata !== undefined) {
      metric.metadata = metadata;
    }

    this.metrics.push(metric);
    this.checkBudgetViolations(metric);
  }

  // Check for budget violations
  private checkBudgetViolations(metric: PerformanceMetric): void {
    const budget = this.budgets.find(b => b.metric === metric.name);
    if (!budget) return;

    const isViolation = metric.value > budget.threshold;
    if (isViolation) {
      console.warn(`Performance budget violation: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${budget.threshold}${budget.unit})`);
      
      // In a real app, you'd send this to your analytics service
      this.reportViolation(budget, metric);
    }
  }

  // Report budget violation
  private reportViolation(budget: PerformanceBudget, metric: PerformanceMetric): void {
    const violation = {
      budget,
      metric,
      timestamp: Date.now(),
      severity: budget.severity
    };

    // In a real app, you'd send this to your error reporting service
    console.error('Performance violation:', violation);
  }

  // Get performance report
  generateReport(): PerformanceReport {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    const violations = this.getViolations(recentMetrics);
    const recommendations = this.generateRecommendations(recentMetrics);
    const score = this.calculateScore(recentMetrics);

    return {
      timestamp: Date.now(),
      metrics: recentMetrics,
      violations,
      recommendations,
      score
    };
  }

  // Get budget violations
  private getViolations(metrics: PerformanceMetric[]): PerformanceBudget[] {
    const violations: PerformanceBudget[] = [];

    for (const metric of metrics) {
      const budget = this.budgets.find(b => b.metric === metric.name);
      if (budget && metric.value > budget.threshold) {
        violations.push(budget);
      }
    }

    return violations;
  }

  // Generate recommendations
  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];

    // Check for slow resources
    const slowResources = metrics.filter(
      m => m.category === 'resource' && m.value > 1000
    );
    if (slowResources.length > 0) {
      recommendations.push('Consider optimizing slow-loading resources');
    }

    // Check for memory issues
    const memoryMetrics = metrics.filter(m => m.category === 'memory');
    const avgMemory = memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length;
    if (avgMemory > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Memory usage is high - consider optimizing memory consumption');
    }

    // Check for layout shifts
    const layoutShifts = metrics.filter(m => m.name === 'Cumulative Layout Shift');
    if (layoutShifts.some(m => m.value > 0.1)) {
      recommendations.push('Layout shifts detected - ensure stable layout');
    }

    // Check for long tasks
    const longTasks = metrics.filter(m => m.name === 'Long Task' && m.value > 50);
    if (longTasks.length > 0) {
      recommendations.push('Long tasks detected - consider breaking up heavy operations');
    }

    return recommendations;
  }

  // Calculate performance score
  private calculateScore(metrics: PerformanceMetric[]): number {
    let score = 100;

    // Deduct points for violations
    const violations = this.getViolations(metrics);
    score -= violations.length * 10;

    // Deduct points for slow metrics
    const slowMetrics = metrics.filter(m => {
      if (m.name === 'First Contentful Paint' && m.value > 1800) return true;
      if (m.name === 'Largest Contentful Paint' && m.value > 2500) return true;
      if (m.name === 'First Input Delay' && m.value > 100) return true;
      return false;
    });

    score -= slowMetrics.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  // Get resource timing data
  getResourceTiming(): ResourceTiming[] {
    if (!('performance' in window)) return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      initiatorType: resource.initiatorType,
      duration: resource.duration,
      size: resource.transferSize,
      startTime: resource.startTime,
      domainLookupStart: resource.domainLookupStart,
      domainLookupEnd: resource.domainLookupEnd,
      connectStart: resource.connectStart,
      connectEnd: resource.connectEnd,
      requestStart: resource.requestStart,
      responseStart: resource.responseStart,
      responseEnd: resource.responseEnd
    }));
  }

  // Get slowest resources
  getSlowestResources(limit: number = 10): ResourceTiming[] {
    const resources = this.getResourceTiming();
    return resources
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Get largest resources
  getLargestResources(limit: number = 10): ResourceTiming[] {
    const resources = this.getResourceTiming();
    return resources
      .sort((a, b) => b.size - a.size)
      .slice(0, limit);
  }

  // Add custom budget
  addBudget(budget: PerformanceBudget): void {
    this.budgets.push(budget);
  }

  // Remove budget
  removeBudget(metricName: string): void {
    this.budgets = this.budgets.filter(b => b.metric !== metricName);
  }

  // Get all budgets
  getBudgets(): PerformanceBudget[] {
    return [...this.budgets];
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Export metrics
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      budgets: this.budgets,
      timestamp: Date.now()
    }, null, 2);
  }

  // Import metrics
  importMetrics(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.metrics) {
        this.metrics = data.metrics;
      }
      
      if (data.budgets) {
        this.budgets = data.budgets;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import metrics:', error);
      return false;
    }
  }

  // Get monitoring status
  isActive(): boolean {
    return this.isMonitoring;
  }

  // Get metrics count
  getMetricsCount(): number {
    return this.metrics.length;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in development
// TEMPORARILY DISABLED: Testing if performance monitor causes rapid re-renders
// Re-enable after confirming UserContext fix resolves the issue
// if (import.meta.env.MODE === 'development') {
//   performanceMonitor.start();
// } 