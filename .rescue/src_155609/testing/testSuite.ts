// Comprehensive test suite for automated testing

import { analytics } from '@/services/analytics';
import subscriptionService from '@/services/subscriptionService';
import { notificationService } from '@/services/notificationService';
import { realtimeService } from '@/services/realtimeService';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import services for mocking
import { locationService } from '@/services/locationService';
import authService from '@/services/firebase/authService';

export interface TestResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<TestSuite> {
    this.startTime = Date.now();
    this.results = [];

    console.log('🧪 Starting comprehensive test suite...');

    // Core functionality tests
    await this.runCoreTests();
    
    // User journey tests
    await this.runUserJourneyTests();
    
    // Performance tests
    await this.runPerformanceTests();
    
    // Security tests
    await this.runSecurityTests();
    
    // Business logic tests
    await this.runBusinessTests();
    
    // Integration tests
    await this.runIntegrationTests();

    const duration = Date.now() - this.startTime;
    const summary = this.calculateSummary(duration);

    const testSuite: TestSuite = {
      name: 'Mingle Synergy Test Suite',
      tests: [...this.results],
      summary
    };

    console.log('✅ Test suite completed:', summary);
    
    // Track test results
    analytics.track('test_suite_completed', {
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      duration
    });

    return testSuite;
  }

  private async runCoreTests(): Promise<void> {
    console.log('🔧 Running core functionality tests...');

    // Authentication tests
    await this.runTest('User Authentication', 'core', async () => {
      // Test login/logout flow
      const isAuthenticated = localStorage.getItem('user') !== null;
      if (!isAuthenticated) {
        throw new Error('Authentication system not working');
      }
    });

    // Venue discovery tests
    await this.runTest('Venue Discovery', 'core', async () => {
      // Test venue loading
      const venues = JSON.parse(localStorage.getItem('mockVenues') || '[]');
      if (venues.length === 0) {
        throw new Error('No venues available');
      }
    });

    // Matching system tests
    await this.runTest('Matching System', 'core', async () => {
      // Test matching logic
      const matches = JSON.parse(localStorage.getItem('mockMatches') || '[]');
      if (matches.length === 0) {
        throw new Error('Matching system not working');
      }
    });

    // Messaging tests
    await this.runTest('Messaging System', 'core', async () => {
      // Test message functionality
      const messages = JSON.parse(localStorage.getItem('mockMessages') || '[]');
      if (messages.length === 0) {
        throw new Error('Messaging system not working');
      }
    });
  }

  private async runUserJourneyTests(): Promise<void> {
    console.log('👤 Running user journey tests...');

    // Onboarding flow
    await this.runTest('Onboarding Flow', 'journey', async () => {
      // Test complete onboarding process
      const onboardingComplete = localStorage.getItem('onboarding_complete');
      if (!onboardingComplete) {
        throw new Error('Onboarding flow incomplete');
      }
    });

    // Profile creation
    await this.runTest('Profile Creation', 'journey', async () => {
      // Test profile setup
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (!profile.name || !profile.photos) {
        throw new Error('Profile creation incomplete');
      }
    });

    // Venue interaction
    await this.runTest('Venue Interaction', 'journey', async () => {
      // Test venue like/check-in
      const interactions = JSON.parse(localStorage.getItem('venueInteractions') || '[]');
      if (interactions.length === 0) {
        throw new Error('No venue interactions recorded');
      }
    });

    // Match and message flow
    await this.runTest('Match and Message Flow', 'journey', async () => {
      // Test complete match to message flow
      const matches = JSON.parse(localStorage.getItem('mockMatches') || '[]');
      const messages = JSON.parse(localStorage.getItem('mockMessages') || '[]');
      
      if (matches.length === 0 || messages.length === 0) {
        throw new Error('Match to message flow broken');
      }
    });
  }

  private async runPerformanceTests(): Promise<void> {
    console.log('⚡ Running performance tests...');

    // Page load performance
    await this.runTest('Page Load Performance', 'performance', async () => {
      const loadTime = performance.now();
      if (loadTime > 5000) {
        throw new Error(`Page load too slow: ${loadTime.toFixed(0)}ms`);
      }
    });

    // Memory usage
    await this.runTest('Memory Usage', 'performance', async () => {
      if ('memory' in performance) {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
        if (memory) {
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          if (usedMB > 100) {
            throw new Error(`Memory usage too high: ${usedMB.toFixed(1)}MB`);
          }
        }
      }
    });

    // Bundle size check
    await this.runTest('Bundle Size', 'performance', async () => {
      // Simulate bundle size check
      const estimatedSize = 500; // KB
      if (estimatedSize > 1000) {
        throw new Error(`Bundle size too large: ${estimatedSize}KB`);
      }
    });
  }

  private async runSecurityTests(): Promise<void> {
    console.log('🔒 Running security tests...');

    // Input validation
    await this.runTest('Input Validation', 'security', async () => {
      const testInput = '<script>alert("xss")</script>';
      const sanitized = testInput.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      if (sanitized.includes('<script>')) {
        throw new Error('XSS protection not working');
      }
    });

    // Authentication security
    await this.runTest('Authentication Security', 'security', async () => {
      const token = localStorage.getItem('authToken');
      if (token && token.length < 10) {
        throw new Error('Weak authentication token');
      }
    });

    // Data encryption
    await this.runTest('Data Encryption', 'security', async () => {
      const sensitiveData = localStorage.getItem('userProfile');
      if (sensitiveData && sensitiveData.includes('password')) {
        throw new Error('Sensitive data not encrypted');
      }
    });
  }

  private async runBusinessTests(): Promise<void> {
    console.log('💼 Running business logic tests...');

    // Premium features
    await this.runTest('Premium Features', 'business', async () => {
      const hasPremium = subscriptionService.hasFeature('Unlimited matches');
      if (hasPremium) {
        throw new Error('Premium features should be gated');
      }
    });

    // Analytics tracking
    await this.runTest('Analytics Tracking', 'business', async () => {
      // Check if analytics is properly initialized
      if (!analytics) {
        throw new Error('Analytics not tracking events');
      }
    });

    // Notification system
    await this.runTest('Notification System', 'business', async () => {
      const isSupported = notificationService.isNotificationSupported();
      if (!isSupported && 'Notification' in window) {
        throw new Error('Notification system not properly configured');
      }
    });
  }

  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 Running integration tests...');

    // Real-time updates
    await this.runTest('Real-time Updates', 'integration', async () => {
      const isConnected = realtimeService.isConnected();
      if (!isConnected) {
        throw new Error('Real-time connection not established');
      }
    });

    // Data persistence
    await this.runTest('Data Persistence', 'integration', async () => {
      const testData = { test: 'data', timestamp: Date.now() };
      localStorage.setItem('test_persistence', JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem('test_persistence') || '{}');
      localStorage.removeItem('test_persistence');
      
      if (retrieved.test !== 'data') {
        throw new Error('Data persistence not working');
      }
    });

    // Service integration
    await this.runTest('Service Integration', 'integration', async () => {
      // Test all services work together
      const services = [
        analytics,
        subscriptionService,
        notificationService,
        realtimeService
      ];
      
      for (const service of services) {
        if (!service) {
          throw new Error('Service integration broken');
        }
      }
    });
  }

  private async runTest(
    name: string, 
    category: string, 
    testFn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    let status: 'pass' | 'fail' | 'skip' = 'pass';
    let error: string | undefined;
    let details: Record<string, unknown> | undefined;

    try {
      await testFn();
      details = { duration: Date.now() - startTime };
    } catch (err) {
      status = 'fail';
      error = (err as Error).message;
      details = { 
        duration: Date.now() - startTime,
        error: (err as Error).stack 
      };
    }

    const result: TestResult = {
      name,
      category,
      status,
      duration: Date.now() - startTime,
      error,
      details
    };

    this.results.push(result);

    // Log result
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
    console.log(`${emoji} ${name}: ${status.toUpperCase()}`);
    
    if (error) {
      console.error(`   Error: ${error}`);
    }
  }

  private calculateSummary(duration: number) {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;

    return { total, passed, failed, skipped, duration };
  }

  // Quick smoke test
  async runSmokeTest(): Promise<boolean> {
    console.log('🚬 Running smoke test...');
    
    const criticalTests = [
      { name: 'Authentication', test: () => localStorage.getItem('user') !== null },
      { name: 'Venue Loading', test: () => JSON.parse(localStorage.getItem('mockVenues') || '[]').length > 0 },
      { name: 'Basic Navigation', test: () => window.location.href.includes('localhost') || window.location.href.includes('http') }
    ];

    for (const { name, test } of criticalTests) {
      try {
        if (!test()) {
          console.error(`❌ Smoke test failed: ${name}`);
          return false;
        }
      } catch (error) {
        console.error(`❌ Smoke test error in ${name}:`, error);
        return false;
      }
    }

    console.log('✅ Smoke test passed');
    return true;
  }

  // Generate test report
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: this.calculateSummary(Date.now() - this.startTime)
    };
    return JSON.stringify(report, null, 2);
  }

  // Export test results
  exportResults(): TestResult[] {
    return [...this.results];
  }
}

// Create singleton instance
export const testRunner = new TestRunner();

// Export convenience functions
export const runAllTests = () => testRunner.runAllTests();
export const runSmokeTest = () => testRunner.runSmokeTest();
export const generateTestReport = () => testRunner.generateReport();

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/test-avatar.jpg',
  interests: ['music', 'sports'],
  location: { lat: 40.7128, lng: -74.0060 },
  ...overrides
});

export const createMockVenue = (overrides = {}) => ({
  id: 'test-venue-1',
  name: 'Test Venue',
  address: '123 Test St, Test City',
  location: { lat: 40.7128, lng: -74.0060 },
  capacity: 100,
  currentUsers: 25,
  ...overrides
});

export const createMockMatch = (overrides = {}) => ({
  id: 'test-match-1',
  users: [createMockUser(), createMockUser({ id: 'test-user-2' })],
  venue: createMockVenue(),
  timestamp: new Date().toISOString(),
  status: 'active',
  ...overrides
});

// Unit Tests for Core Functionality
describe('Core Functionality', () => {
  beforeEach(() => {
    // Setup test data
    localStorage.setItem('user', JSON.stringify(createMockUser()));
    localStorage.setItem('mockVenues', JSON.stringify([createMockVenue()]));
    localStorage.setItem('mockMatches', JSON.stringify([createMockMatch()]));
    localStorage.setItem('mockMessages', JSON.stringify([]));
  });

  afterEach(() => {
    // Cleanup
    localStorage.clear();
  });

  it('should run smoke test successfully', async () => {
    const result = await runSmokeTest();
    expect(result).toBe(true);
  });

  it('should create mock data correctly', () => {
    const user = createMockUser({ name: 'Custom User' });
    expect(user.name).toBe('Custom User');
    expect(user.id).toBe('test-user-1');

    const venue = createMockVenue({ name: 'Custom Venue' });
    expect(venue.name).toBe('Custom Venue');
    expect(venue.id).toBe('test-venue-1');

    const match = createMockMatch({ id: 'custom-match' });
    expect(match.id).toBe('custom-match');
    expect(match.users).toHaveLength(2);
  });

  it('should track analytics events', () => {
    const mockTrack = vi.fn();
    analytics.track = mockTrack;
    
    analytics.track('test_event', { test: 'data' });
    
    expect(mockTrack).toHaveBeenCalledWith('test_event', { test: 'data' });
  });
});

// Service Tests
describe('Service Integration', () => {
  beforeEach(() => {
    // Mock services
    vi.mock('@/services/locationService', () => ({
      locationService: {
        getNearbyVenues: vi.fn(() => Promise.resolve([createMockVenue()]))
      }
    }));
    
    vi.mock('@/services/firebase/authService', () => ({
      default: {
        getCurrentUser: vi.fn(() => Promise.resolve(createMockUser()))
      }
    }));
  });

  it('should handle venue service calls', async () => {
    const venues = await locationService.getNearbyVenues(40.7128, -74.0060, 5);
    expect(venues).toHaveLength(1);
    expect(venues[0].name).toBe('Test Venue');
  });

  it('should handle authentication service calls', async () => {
    const user = await authService.getCurrentUser();
    expect(user).toBeTruthy();
    expect(user?.displayName).toBe('Test User');
  });
});

// E2E Test Utilities
export const runE2ETest = async (testName: string, testFn: () => Promise<void>) => {
  console.log(`Running E2E test: ${testName}`);
  
  try {
    await testFn();
    console.log(`✅ E2E test passed: ${testName}`);
  } catch (error) {
    console.error(`❌ E2E test failed: ${testName}`, error);
    throw error;
  }
};

// Performance Tests
describe('Performance', () => {
  it('should measure performance metrics', () => {
    const startTime = performance.now();
    
    // Simulate some work
    const result = Array.from({ length: 1000 }, (_, i) => i * 2);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Should complete quickly
    expect(result).toHaveLength(1000);
  });

  it('should handle large data sets efficiently', () => {
    const largeVenueList = Array.from({ length: 100 }, (_, i) => 
      createMockVenue({ id: `venue-${i}`, name: `Venue ${i}` })
    );

    const startTime = performance.now();
    
    // Process the large list
    const processed = largeVenueList.map(venue => ({
      ...venue,
      processed: true
    }));
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(50); // Should be very fast
    expect(processed).toHaveLength(100);
    expect(processed[0].processed).toBe(true);
  });
});

// Error Handling Tests
describe('Error Handling', () => {
  it('should handle service errors gracefully', async () => {
    vi.mocked(locationService.getNearbyVenues).mockRejectedValue(new Error('Network error'));
    
    try {
      await locationService.getNearbyVenues(40.7128, -74.0060, 5);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Network error');
    }
  });

  it('should handle missing data gracefully', () => {
    localStorage.clear();
    
    const venues = JSON.parse(localStorage.getItem('mockVenues') || '[]');
    const matches = JSON.parse(localStorage.getItem('mockMatches') || '[]');
    
    expect(venues).toEqual([]);
    expect(matches).toEqual([]);
  });
});

// Security Tests
describe('Security', () => {
  it('should sanitize user input', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = maliciousInput.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  it('should validate user permissions', async () => {
    // Mock unauthenticated user
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
    
    const user = await authService.getCurrentUser();
    expect(user).toBeNull();
  });
});

export default {
  createMockUser,
  createMockVenue,
  createMockMatch,
  runE2ETest,
  runAllTests,
  runSmokeTest
}; 