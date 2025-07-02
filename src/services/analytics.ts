// Analytics service for tracking user behavior and app performance

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserBehavior {
  pageViews: Record<string, number>;
  timeSpent: Record<string, number>;
  interactions: Record<string, number>;
  lastActivity: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userBehavior: UserBehavior = {
    pageViews: {},
    timeSpent: {},
    interactions: {},
    lastActivity: Date.now()
  };
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    // Track page views
    this.trackPageView(window.location.pathname);
    
    // Track time spent on pages
    this.startTimeTracking();
    
    // Track user interactions
    this.trackUserInteractions();
  }

  private startTimeTracking(): void {
    let startTime = Date.now();
    const currentPage = window.location.pathname;

    // Update time spent when user leaves page
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime;
      this.updateTimeSpent(currentPage, timeSpent);
    };

    // Update time spent when user navigates
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timeSpent = Date.now() - startTime;
        this.updateTimeSpent(currentPage, timeSpent);
      } else {
        startTime = Date.now();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up on page unload
    window.addEventListener('unload', () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
  }

  private trackUserInteractions(): void {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;

      // Track button clicks
      if (tagName === 'button' || className.includes('btn') || className.includes('button')) {
        this.track('button_click', {
          buttonText: target.textContent?.trim(),
          buttonClass: className,
          buttonId: id
        });
      }

      // Track form interactions
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        this.track('form_interaction', {
          fieldType: target.getAttribute('type') || tagName,
          fieldName: target.getAttribute('name'),
          fieldId: id
        });
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (maxScrollDepth % 25 === 0) { // Track every 25%
          this.track('scroll_depth', { depth: maxScrollDepth });
        }
      }
    });
  }

  track(event: string, properties?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);
    this.userBehavior.lastActivity = Date.now();

    // In a real app, you'd send this to your analytics service
    console.log('Analytics Event:', analyticsEvent);
  }

  trackPageView(page: string): void {
    this.userBehavior.pageViews[page] = (this.userBehavior.pageViews[page] || 0) + 1;
    this.track('page_view', { page });
  }

  trackUserAction(action: string, details?: Record<string, unknown>): void {
    this.userBehavior.interactions[action] = (this.userBehavior.interactions[action] || 0) + 1;
    this.track('user_action', { action, ...details });
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  trackPerformance(metric: string, value: number): void {
    this.track('performance', { metric, value });
  }

  private updateTimeSpent(page: string, timeMs: number): void {
    this.userBehavior.timeSpent[page] = (this.userBehavior.timeSpent[page] || 0) + timeMs;
  }

  // User journey tracking
  trackOnboardingStep(step: string, completed: boolean): void {
    this.track('onboarding_step', { step, completed });
  }

  trackMatch(matchId: string, venueId: string): void {
    this.track('match_created', { matchId, venueId });
  }

  trackMessage(messageType: 'sent' | 'received', matchId: string): void {
    this.track('message', { type: messageType, matchId });
  }

  trackVenueVisit(venueId: string, action: 'view' | 'like' | 'check_in'): void {
    this.track('venue_interaction', { venueId, action });
  }

  // Get analytics data
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getUserBehavior(): UserBehavior {
    return { ...this.userBehavior };
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Export data for analysis
  exportData(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      events: this.events,
      userBehavior: this.userBehavior,
      timestamp: Date.now()
    };
  }

  // Enable/disable tracking
  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  // Clear data
  clear(): void {
    this.events = [];
    this.userBehavior = {
      pageViews: {},
      timeSpent: {},
      interactions: {},
      lastActivity: Date.now()
    };
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Performance monitoring
export const trackPerformance = (): void => {
  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    analytics.trackPerformance('page_load_time', loadTime);
  });

  // Track navigation timing
  if ('navigation' in performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      analytics.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      analytics.trackPerformance('first_paint', navigation.loadEventEnd - navigation.loadEventStart);
    }
  }
};

// Initialize performance tracking
trackPerformance(); 