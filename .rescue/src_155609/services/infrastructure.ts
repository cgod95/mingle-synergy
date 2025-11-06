// Infrastructure service for scalability, API versioning, CDN, and monitoring

export interface APIVersion {
  version: string;
  status: 'stable' | 'beta' | 'deprecated' | 'sunset';
  releaseDate: string;
  sunsetDate?: string;
  breakingChanges: string[];
  newFeatures: string[];
  documentation: string;
}

export interface CDNConfig {
  provider: 'cloudflare' | 'aws-cloudfront' | 'vercel' | 'custom';
  baseUrl: string;
  cacheHeaders: Record<string, string>;
  imageOptimization: {
    enabled: boolean;
    formats: string[];
    quality: number;
    sizes: number[];
  };
}

export interface MonitoringMetrics {
  timestamp: number;
  responseTime: number;
  statusCode: number;
  endpoint: string;
  userId?: string;
  error?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: 'threshold' | 'trend' | 'anomaly';
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[]; // email, slack, webhook, etc.
  enabled: boolean;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  errorRate: number;
  userSessions: number;
  activeUsers: number;
  timestamp?: number;
}

class InfrastructureService {
  private readonly currentAPIVersion = 'v1';
  private readonly supportedVersions: APIVersion[] = [
    {
      version: 'v1',
      status: 'stable',
      releaseDate: '2024-01-01',
      breakingChanges: [],
      newFeatures: ['Initial release'],
      documentation: '/api/v1/docs'
    },
    {
      version: 'v2',
      status: 'beta',
      releaseDate: '2024-06-01',
      breakingChanges: ['Changed user profile structure'],
      newFeatures: ['Advanced matching', 'Real-time notifications'],
      documentation: '/api/v2/docs'
    }
  ];

  private readonly cdnConfig: CDNConfig = {
    provider: 'vercel',
    baseUrl: 'https://cdn.mingle.app',
    cacheHeaders: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000',
      'Vercel-CDN-Cache-Control': 'public, max-age=31536000'
    },
    imageOptimization: {
      enabled: true,
      formats: ['webp', 'avif', 'jpeg'],
      quality: 80,
      sizes: [320, 640, 768, 1024, 1280, 1920]
    }
  };

  private readonly alertRules: AlertRule[] = [
    {
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: 'threshold',
      metric: 'error_rate',
      threshold: 0.05, // 5%
      operator: 'gt',
      duration: 300, // 5 minutes
      severity: 'high',
      channels: ['email', 'slack'],
      enabled: true
    },
    {
      id: 'slow-response-time',
      name: 'Slow Response Time',
      condition: 'threshold',
      metric: 'response_time',
      threshold: 2000, // 2 seconds
      operator: 'gt',
      duration: 60, // 1 minute
      severity: 'medium',
      channels: ['slack'],
      enabled: true
    },
    {
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      condition: 'threshold',
      metric: 'memory_usage',
      threshold: 0.9, // 90%
      operator: 'gt',
      duration: 300, // 5 minutes
      severity: 'critical',
      channels: ['email', 'slack', 'webhook'],
      enabled: true
    }
  ];

  private metrics: MonitoringMetrics[] = [];
  private performanceData: PerformanceMetrics[] = [];

  // API Versioning
  getAPIVersions(): APIVersion[] {
    return this.supportedVersions;
  }

  getCurrentVersion(): string {
    return this.currentAPIVersion;
  }

  isVersionSupported(version: string): boolean {
    return this.supportedVersions.some(v => 
      v.version === version && v.status !== 'sunset'
    );
  }

  getVersionInfo(version: string): APIVersion | null {
    return this.supportedVersions.find(v => v.version === version) || null;
  }

  deprecateVersion(version: string, sunsetDate: string): boolean {
    const versionInfo = this.supportedVersions.find(v => v.version === version);
    if (versionInfo) {
      versionInfo.status = 'deprecated';
      versionInfo.sunsetDate = sunsetDate;
      return true;
    }
    return false;
  }

  // CDN Integration
  getCDNConfig(): CDNConfig {
    return this.cdnConfig;
  }

  getCDNUrl(path: string): string {
    return `${this.cdnConfig.baseUrl}/${path}`;
  }

  getOptimizedImageUrl(
    originalUrl: string,
    width: number,
    format: string = 'webp',
    quality: number = 80
  ): string {
    if (!this.cdnConfig.imageOptimization.enabled) {
      return originalUrl;
    }

    const params = new URLSearchParams({
      w: width.toString(),
      f: format,
      q: quality.toString()
    });

    return `${this.cdnConfig.baseUrl}/image/${encodeURIComponent(originalUrl)}?${params}`;
  }

  getCacheHeaders(resourceType: 'static' | 'dynamic' | 'api'): Record<string, string> {
    const baseHeaders = this.cdnConfig.cacheHeaders;
    
    switch (resourceType) {
      case 'static':
        return {
          ...baseHeaders,
          'Cache-Control': 'public, max-age=31536000, immutable'
        };
      case 'dynamic':
        return {
          ...baseHeaders,
          'Cache-Control': 'public, max-age=3600'
        };
      case 'api':
        return {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        };
      default:
        return baseHeaders;
    }
  }

  // Monitoring and Metrics
  trackMetric(metric: MonitoringMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check alert rules
    this.checkAlertRules(metric);
  }

  trackPerformance(metrics: PerformanceMetrics): void {
    this.performanceData.push({ ...metrics, timestamp: Date.now() });
    
    // Keep only last 100 performance records
    if (this.performanceData.length > 100) {
      this.performanceData = this.performanceData.slice(-100);
    }
  }

  getMetrics(timeRange: 'hour' | 'day' | 'week' = 'hour'): MonitoringMetrics[] {
    const now = Date.now();
    const timeRanges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - timeRanges[timeRange];
    return this.metrics.filter(metric => metric.timestamp >= cutoff);
  }

  getPerformanceMetrics(timeRange: 'hour' | 'day' | 'week' = 'hour'): PerformanceMetrics[] {
    const now = Date.now();
    const timeRanges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - timeRanges[timeRange];
    return this.performanceData.filter(metric => metric.timestamp >= cutoff);
  }

  // Alerting
  getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  updateAlertRule(id: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.alertRules.findIndex(rule => rule.id === id);
    if (ruleIndex !== -1) {
      this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  deleteAlertRule(id: string): boolean {
    const ruleIndex = this.alertRules.findIndex(rule => rule.id === id);
    if (ruleIndex !== -1) {
      this.alertRules.splice(ruleIndex, 1);
      return true;
    }
    return false;
  }

  private checkAlertRules(metric: MonitoringMetrics): void {
    const recentMetrics = this.getMetrics('hour');
    
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const relevantMetrics = recentMetrics.filter(m => 
        m.endpoint === metric.endpoint && 
        m.timestamp >= Date.now() - rule.duration * 1000
      );

      if (relevantMetrics.length === 0) continue;

      const shouldAlert = this.evaluateAlertCondition(rule, relevantMetrics);
      
      if (shouldAlert) {
        this.triggerAlert(rule, relevantMetrics);
      }
    }
  }

  private evaluateAlertCondition(rule: AlertRule, metrics: MonitoringMetrics[]): boolean {
    switch (rule.condition) {
      case 'threshold':
        return this.evaluateThresholdCondition(rule, metrics);
      case 'trend':
        return this.evaluateTrendCondition(rule, metrics);
      case 'anomaly':
        return this.evaluateAnomalyCondition(rule, metrics);
      default:
        return false;
    }
  }

  private evaluateThresholdCondition(rule: AlertRule, metrics: MonitoringMetrics[]): boolean {
    const values = this.extractMetricValues(rule.metric, metrics);
    if (values.length === 0) return false;

    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    switch (rule.operator) {
      case 'gt': return avgValue > rule.threshold;
      case 'lt': return avgValue < rule.threshold;
      case 'eq': return avgValue === rule.threshold;
      case 'gte': return avgValue >= rule.threshold;
      case 'lte': return avgValue <= rule.threshold;
      default: return false;
    }
  }

  private evaluateTrendCondition(rule: AlertRule, metrics: MonitoringMetrics[]): boolean {
    // Simple trend detection - check if values are consistently increasing/decreasing
    const values = this.extractMetricValues(rule.metric, metrics);
    if (values.length < 3) return false;

    const recentValues = values.slice(-3);
    const isIncreasing = recentValues.every((val, i) => i === 0 || val > recentValues[i - 1]);
    const isDecreasing = recentValues.every((val, i) => i === 0 || val < recentValues[i - 1]);

    return isIncreasing || isDecreasing;
  }

  private evaluateAnomalyCondition(rule: AlertRule, metrics: MonitoringMetrics[]): boolean {
    // Simple anomaly detection using standard deviation
    const values = this.extractMetricValues(rule.metric, metrics);
    if (values.length < 5) return false;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const latestValue = values[values.length - 1];
    const zScore = Math.abs((latestValue - mean) / stdDev);

    return zScore > 2; // Alert if value is more than 2 standard deviations from mean
  }

  private extractMetricValues(metricName: string, metrics: MonitoringMetrics[]): number[] {
    return metrics.map(metric => {
      switch (metricName) {
        case 'response_time': return metric.responseTime;
        case 'error_rate': return metric.statusCode >= 400 ? 1 : 0;
        case 'status_code': return metric.statusCode;
        default: return 0;
      }
    });
  }

  private triggerAlert(rule: AlertRule, metrics: MonitoringMetrics[]): void {
    const alert = {
      id: `${rule.id}-${Date.now()}`,
      rule,
      timestamp: Date.now(),
      metrics: metrics.slice(-10), // Last 10 metrics
      severity: rule.severity,
      message: `Alert: ${rule.name} triggered`
    };

    console.warn('Infrastructure Alert:', alert);

    // Send to alert channels
    rule.channels.forEach(channel => {
      this.sendAlertToChannel(channel, alert);
    });
  }

  private sendAlertToChannel(channel: string, alert: Record<string, unknown>): void {
    switch (channel) {
      case 'email':
        this.sendEmailAlert(alert);
        break;
      case 'slack':
        this.sendSlackAlert(alert);
        break;
      case 'webhook':
        this.sendWebhookAlert(alert);
        break;
      default:
        console.warn(`Unknown alert channel: ${channel}`);
    }
  }

  private sendEmailAlert(alert: Record<string, unknown>): void {
    // In a real app, this would send an email
    console.log('Email alert sent:', alert.message);
  }

  private sendSlackAlert(alert: Record<string, unknown>): void {
    // In a real app, this would send to Slack
    console.log('Slack alert sent:', alert.message);
  }

  private sendWebhookAlert(alert: Record<string, unknown>): void {
    // In a real app, this would send to webhook
    console.log('Webhook alert sent:', alert.message);
  }

  // Health checks
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: number;
  }> {
    const checks = {
      database: await this.checkDatabase(),
      api: await this.checkAPI(),
      cdn: await this.checkCDN(),
      memory: await this.checkMemory(),
      disk: await this.checkDisk()
    };

    const allHealthy = Object.values(checks).every(check => check);
    const someHealthy = Object.values(checks).some(check => check);

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (allHealthy) {
      status = 'healthy';
    } else if (someHealthy) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      timestamp: Date.now()
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      // In a real app, this would check database connectivity
      return true;
    } catch {
      return false;
    }
  }

  private async checkAPI(): Promise<boolean> {
    try {
      // In a real app, this would check API endpoints
      return true;
    } catch {
      return false;
    }
  }

  private async checkCDN(): Promise<boolean> {
    try {
      // In a real app, this would check CDN availability
      return true;
    } catch {
      return false;
    }
  }

  private async checkMemory(): Promise<boolean> {
    try {
      // In a real app, this would check memory usage
      return true;
    } catch {
      return false;
    }
  }

  private async checkDisk(): Promise<boolean> {
    try {
      // In a real app, this would check disk space
      return true;
    } catch {
      return false;
    }
  }

  // Export infrastructure data
  exportInfrastructureData(): string {
    return JSON.stringify({
      apiVersions: this.supportedVersions,
      cdnConfig: this.cdnConfig,
      alertRules: this.alertRules,
      metrics: this.metrics.slice(-100), // Last 100 metrics
      performance: this.performanceData.slice(-50), // Last 50 performance records
      timestamp: Date.now()
    }, null, 2);
  }
}

// Export singleton instance
export const infrastructure = new InfrastructureService(); 