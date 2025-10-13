// Comprehensive analytics service for user engagement and insights

import logger from '@/utils/Logger';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserEngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: number;
  pagesPerSession: number;
  retentionRate: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export interface MatchSuccessMetrics {
  totalMatches: number;
  successfulMatches: number; // Matches that led to messages
  matchRate: number; // Matches per user
  messageRate: number; // Messages per match
  responseRate: number; // Response rate to messages
  timeToFirstMessage: number; // Average time from match to first message
  venueMatchRate: Record<string, number>; // Match rate by venue
}

export interface VenueAnalytics {
  venueId: string;
  venueName: string;
  checkIns: number;
  uniqueUsers: number;
  matches: number;
  matchRate: number;
  averageTimeSpent: number;
  popularHours: Record<number, number>; // Hour -> count
  userRetention: number; // Users who return
}

export interface UserBehaviorInsights {
  userId: string;
  profileCompleteness: number;
  activityLevel: 'low' | 'medium' | 'high';
  preferredVenues: string[];
  preferredTimes: string[];
  interactionPatterns: {
    likesGiven: number;
    likesReceived: number;
    messagesSent: number;
    messagesReceived: number;
    matchesInitiated: number;
    matchesReceived: number;
  };
  engagementScore: number; // 0-100
}

interface UserBehavior {
  pageViews: Record<string, number>;
  timeOnSite: number;
  interactions: string[];
  conversionFunnel: {
    signup: number;
    profile_complete: number;
    first_venue: number;
    first_like: number;
    first_match: number;
    first_message: number;
  };
}

interface MatchAnalytics {
  totalMatches: number;
  matchRate: number;
  averageTimeToMatch: number;
  venueMatchRates: Record<string, number>;
  userTypeMatchRates: Record<string, number>;
}

interface MatchData {
  matchId: string;
  userId: string;
  matchedUserId: string;
  venueId?: string;
  venueName?: string;
  timeToMatch: number;
  mutualInterests: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private sessionId: string;
  private userId?: string;
  private userBehavior: UserBehavior;
  private matchAnalytics: MatchAnalytics;
  private readonly storageKey = 'mingle_analytics_events';
  private readonly maxEvents = 1000; // Keep last 1000 events in memory

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userBehavior = {
      pageViews: {},
      timeOnSite: 0,
      interactions: [],
      conversionFunnel: {
        signup: 0,
        profile_complete: 0,
        first_venue: 0,
        first_like: 0,
        first_match: 0,
        first_message: 0
      }
    };
    this.matchAnalytics = {
      totalMatches: 0,
      matchRate: 0,
      averageTimeToMatch: 0,
      venueMatchRates: {},
      userTypeMatchRates: {}
    };
    
    this.initializeTracking();
    this.loadEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    // Track page views
    this.trackPageView(window.location.pathname);
    
    // Track time on site
    setInterval(() => {
      this.userBehavior.timeOnSite += 1;
    }, 1000);

    // Track user interactions
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        this.track('button_clicked', {
          button_text: target.textContent?.trim(),
          button_type: target.getAttribute('data-type') || 'unknown'
        });
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.track('scroll_depth', { depth: maxScrollDepth });
      }
    });
  }

  // Core tracking methods
  track(eventName: string, properties: Record<string, unknown> = {}) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        session_id: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        user_agent: navigator.userAgent
      },
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.processEvent(event);
    
    // Send to analytics service (in production, this would be Firebase Analytics, Mixpanel, etc.)
    this.sendToAnalyticsService(event);
  }

  trackPageView(page: string) {
    this.userBehavior.pageViews[page] = (this.userBehavior.pageViews[page] || 0) + 1;
    this.track('page_view', { page });
  }

  trackUserBehavior(action: string, data?: unknown) {
    this.userBehavior.interactions.push(action);
    this.track('user_behavior', { action, data });
  }

  // Conversion funnel tracking
  trackConversionFunnel(step: keyof UserBehavior['conversionFunnel']) {
    this.userBehavior.conversionFunnel[step] = Date.now();
    this.track('conversion_funnel', { step, timestamp: Date.now() });
  }

  // Match analytics
  trackMatch(matchData: MatchData) {
    this.matchAnalytics.totalMatches++;
    
    this.track('match_created', {
      match_id: matchData.matchId,
      user_id: matchData.userId,
      matched_user_id: matchData.matchedUserId,
      venue_id: matchData.venueId,
      venue_name: matchData.venueName,
      time_to_match: matchData.timeToMatch,
      mutual_interests: matchData.mutualInterests
    });

    // Update venue match rates
    if (matchData.venueId) {
      this.matchAnalytics.venueMatchRates[matchData.venueId] = 
        (this.matchAnalytics.venueMatchRates[matchData.venueId] || 0) + 1;
    }
  }

  // Venue analytics
  trackVenueInteraction(venueId: string, action: string, data?: unknown) {
    this.track('venue_interaction', {
      venue_id: venueId,
      action,
      data
    });
  }

  // A/B Testing
  trackABTest(testName: string, variant: string, conversion?: boolean) {
    this.track('ab_test', {
      test_name: testName,
      variant,
      conversion
    });
  }

  // Performance tracking
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.track('performance', {
      metric,
      value,
      unit
    });
  }

  // Error tracking
  trackError(error: Error, context?: unknown) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      context
    });
  }

  // User engagement
  trackEngagement(action: string, duration?: number) {
    this.track('engagement', {
      action,
      duration,
      time_on_site: this.userBehavior.timeOnSite
    });
  }

  // Revenue tracking
  trackRevenue(amount: number, currency: string = 'USD', source?: string) {
    this.track('revenue', {
      amount,
      currency,
      source
    });
  }

  // Custom event tracking
  trackCustomEvent(eventName: string, properties: Record<string, unknown> = {}) {
    this.track(eventName, properties);
  }

  // Analytics processing
  private processEvent(event: AnalyticsEvent) {
    switch (event.name) {
      case 'user_signed_up':
        this.trackConversionFunnel('signup');
        break;
      case 'profile_completed':
        this.trackConversionFunnel('profile_complete');
        break;
      case 'venue_visited':
        this.trackConversionFunnel('first_venue');
        break;
      case 'like_sent':
        this.trackConversionFunnel('first_like');
        break;
      case 'match_created':
        this.trackConversionFunnel('first_match');
        break;
      case 'message_sent':
        this.trackConversionFunnel('first_message');
        break;
    }
  }

  // Send to analytics service (placeholder for production)
  private sendToAnalyticsService(event: AnalyticsEvent) {
    // In production, this would send to Firebase Analytics, Mixpanel, etc.
    if (process.env.NODE_ENV === 'development') {
      logger.info('Analytics Event:', event);
    }
    
    // Example: Send to Firebase Analytics
    // if (window.gtag) {
    //   window.gtag('event', event.name, event.properties);
    // }
  }

  // Analytics reporting
  getAnalyticsReport() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      userBehavior: this.userBehavior,
      matchAnalytics: this.matchAnalytics,
      events: this.events.length,
      timeOnSite: this.userBehavior.timeOnSite
    };
  }

  // Export analytics data
  exportAnalyticsData() {
    return {
      events: this.events,
      userBehavior: this.userBehavior,
      matchAnalytics: this.matchAnalytics,
      timestamp: Date.now()
    };
  }

  // Set user ID for tracking
  setUserId(userId: string) {
    this.userId = userId;
    this.track('user_identified', { user_id: userId });
  }

  // Enable/disable tracking
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  // Clear analytics data
  clear() {
    this.events = [];
    this.userBehavior = {
      pageViews: {},
      timeOnSite: 0,
      interactions: [],
      conversionFunnel: {
        signup: 0,
        profile_complete: 0,
        first_venue: 0,
        first_like: 0,
        first_match: 0,
        first_message: 0
      }
    };
  }

  // Load events from localStorage
  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      logger.warn('Failed to load analytics events:', error);
      this.events = [];
    }
  }

  // Save events to localStorage
  private saveEvents(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (error) {
      logger.warn('Failed to save analytics events:', error);
    }
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Export individual tracking functions for convenience
export const track = (eventName: string, properties?: Record<string, unknown>) => {
  analytics.track(eventName, properties);
};

export const trackPageView = (page: string) => {
  analytics.trackPageView(page);
};

export const trackMatch = (matchData: MatchData) => {
  analytics.trackMatch(matchData);
};

export const trackVenueInteraction = (venueId: string, action: string, data?: unknown) => {
  analytics.trackVenueInteraction(venueId, action, data);
};

export const trackABTest = (testName: string, variant: string, conversion?: boolean) => {
  analytics.trackABTest(testName, variant, conversion);
};

export const trackPerformance = (metric: string, value: number, unit?: string) => {
  analytics.trackPerformance(metric, value, unit);
};

export const trackError = (error: Error, context?: unknown) => {
  analytics.trackError(error, context);
};

export const trackEngagement = (action: string, duration?: number) => {
  analytics.trackEngagement(action, duration);
};

export const trackRevenue = (amount: number, currency?: string, source?: string) => {
  analytics.trackRevenue(amount, currency, source);
};

export default analytics; 