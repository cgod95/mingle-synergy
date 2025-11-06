// Microservices architecture foundation

export interface ServiceConfig {
  name: string;
  url: string;
  healthCheck: string;
  timeout: number;
  retries: number;
}

export interface ServiceResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

interface MicroserviceMessage {
  type: string;
  data: unknown;
  timestamp: number;
  serviceId: string;
}

interface ServiceRegistry {
  [key: string]: {
    url: string;
    health: 'healthy' | 'unhealthy';
    lastCheck: number;
  };
}

export class MicroserviceManager {
  private services: ServiceRegistry = {};
  private messageQueue: MicroserviceMessage[] = [];

  register(service: ServiceConfig): void {
    this.services.set(service.name, {
      url: service.url,
      health: 'healthy',
      lastCheck: Date.now(),
    });
  }

  unregister(serviceName: string): void {
    this.services.delete(serviceName);
  }

  get(serviceName: string): ServiceConfig | undefined {
    const service = this.services.get(serviceName);
    if (service) {
      return {
        name: serviceName,
        url: service.url,
        healthCheck: '',
        timeout: 0,
        retries: 0,
      };
    }
    return undefined;
  }

  getAll(): ServiceConfig[] {
    return Array.from(this.services.values()).map(service => ({
      name: service.name,
      url: service.url,
      healthCheck: '',
      timeout: 0,
      retries: 0,
    }));
  }

  setHealth(serviceName: string, isHealthy: boolean): void {
    if (isHealthy) {
      this.services.set(serviceName, {
        url: this.services.get(serviceName)?.url || '',
        health: 'healthy',
        lastCheck: Date.now(),
      });
    } else {
      this.services.set(serviceName, {
        url: this.services.get(serviceName)?.url || '',
        health: 'unhealthy',
        lastCheck: Date.now(),
      });
    }
  }

  isHealthy(serviceName: string): boolean {
    const service = this.services.get(serviceName);
    return service?.health === 'healthy';
  }

  getHealthyServices(): ServiceConfig[] {
    return this.getAll().filter(service => this.isHealthy(service.name));
  }
}

class LoadBalancer {
  private currentIndex = 0;

  roundRobin(services: ServiceConfig[]): ServiceConfig | null {
    if (services.length === 0) return null;
    
    const service = services[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % services.length;
    return service;
  }

  random(services: ServiceConfig[]): ServiceConfig | null {
    if (services.length === 0) return null;
    return services[Math.floor(Math.random() * services.length)];
  }

  leastConnections(services: ServiceConfig[]): ServiceConfig | null {
    // In a real implementation, track active connections
    return this.random(services);
  }
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  private readonly failureThreshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

class MicroserviceClient {
  private registry: MicroserviceManager;
  private loadBalancer: LoadBalancer;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor() {
    this.registry = new MicroserviceManager();
    this.loadBalancer = new LoadBalancer();
  }

  // Register services
  registerService(service: ServiceConfig): void {
    this.registry.register(service);
  }

  // Make service call with retry and circuit breaker
  async callService<T>(
    serviceName: string,
    endpoint: string,
    options: RequestInit = {},
    strategy: 'roundRobin' | 'random' | 'leastConnections' = 'roundRobin'
  ): Promise<ServiceResponse<T>> {
    const service = this.getService(serviceName, strategy);
    if (!service) {
      throw new Error(`Service ${serviceName} not available`);
    }

    const circuitBreaker = this.getCircuitBreaker(serviceName);
    
    return circuitBreaker.execute(
      () => this.makeRequest<T>(service, endpoint, options),
      () => this.getFallbackResponse<T>(serviceName, endpoint)
    );
  }

  private getService(serviceName: string, strategy: string): ServiceConfig | null {
    const healthyServices = this.registry.getHealthyServices()
      .filter(service => service.name === serviceName);

    switch (strategy) {
      case 'roundRobin':
        return this.loadBalancer.roundRobin(healthyServices);
      case 'random':
        return this.loadBalancer.random(healthyServices);
      case 'leastConnections':
        return this.loadBalancer.leastConnections(healthyServices);
      default:
        return this.loadBalancer.roundRobin(healthyServices);
    }
  }

  private getCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker());
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  private async makeRequest<T>(
    service: ServiceConfig,
    endpoint: string,
    options: RequestInit
  ): Promise<ServiceResponse<T>> {
    const url = `${service.url}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), service.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: Date.now(),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async getFallbackResponse<T>(
    serviceName: string,
    endpoint: string
  ): Promise<ServiceResponse<T>> {
    // In a real implementation, this could return cached data or default values
    throw new Error(`Fallback not implemented for ${serviceName}${endpoint}`);
  }

  // Health check all services
  async healthCheck(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const service of this.registry.getAll()) {
      try {
        const response = await fetch(`${service.url}${service.healthCheck}`, {
          method: 'GET',
          timeout: 5000,
        });
        
        const isHealthy = response.ok;
        results.set(service.name, isHealthy);
        this.registry.setHealth(service.name, isHealthy);
      } catch (error) {
        results.set(service.name, false);
        this.registry.setHealth(service.name, false);
      }
    }

    return results;
  }

  // Get service statistics
  getStats(): {
    totalServices: number;
    healthyServices: number;
    circuitBreakers: Record<string, string>;
  } {
    const allServices = this.registry.getAll();
    const healthyServices = this.registry.getHealthyServices();
    
    const circuitBreakers: Record<string, string> = {};
    for (const [serviceName, circuitBreaker] of this.circuitBreakers) {
      circuitBreakers[serviceName] = circuitBreaker.getState();
    }

    return {
      totalServices: allServices.length,
      healthyServices: healthyServices.length,
      circuitBreakers,
    };
  }
}

// Create singleton instance
export const microserviceClient = new MicroserviceClient();

// Service definitions
export const SERVICES = {
  AUTH: 'auth-service',
  USER: 'user-service',
  MATCHING: 'matching-service',
  MESSAGING: 'messaging-service',
  ANALYTICS: 'analytics-service',
  PAYMENT: 'payment-service',
} as const;

// Initialize default services
microserviceClient.registerService({
  name: SERVICES.AUTH,
  url: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
  healthCheck: '/health',
  timeout: 10000,
  retries: 3,
});

microserviceClient.registerService({
  name: SERVICES.USER,
  url: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3002',
  healthCheck: '/health',
  timeout: 10000,
  retries: 3,
});

microserviceClient.registerService({
  name: SERVICES.MATCHING,
  url: import.meta.env.VITE_MATCHING_SERVICE_URL || 'http://localhost:3003',
  healthCheck: '/health',
  timeout: 15000,
  retries: 3,
});

microserviceClient.registerService({
  name: SERVICES.MESSAGING,
  url: import.meta.env.VITE_MESSAGING_SERVICE_URL || 'http://localhost:3004',
  healthCheck: '/health',
  timeout: 10000,
  retries: 3,
});

// Export convenience functions
export const callAuthService = <T>(endpoint: string, options?: RequestInit) =>
  microserviceClient.callService<T>(SERVICES.AUTH, endpoint, options);

export const callUserService = <T>(endpoint: string, options?: RequestInit) =>
  microserviceClient.callService<T>(SERVICES.USER, endpoint, options);

export const callMatchingService = <T>(endpoint: string, options?: RequestInit) =>
  microserviceClient.callService<T>(SERVICES.MATCHING, endpoint, options);

export const callMessagingService = <T>(endpoint: string, options?: RequestInit) =>
  microserviceClient.callService<T>(SERVICES.MESSAGING, endpoint, options); 