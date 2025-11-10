// Analytics Service - Plausible/PostHog Integration
// Per spec section 3.2: "Basic analytics (Plausible or PostHog): anonymized"

interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
}

class AnalyticsService {
  private provider: 'plausible' | 'posthog' | 'none' = 'none';
  private enabled: boolean = false;
  private plausibleDomain: string = '';
  private posthogApiKey: string = '';

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check environment variables for analytics configuration
    const analyticsId = import.meta.env.VITE_ANALYTICS_ID || '';
    const analyticsProvider = import.meta.env.VITE_ANALYTICS_PROVIDER || 'none';

    if (analyticsProvider === 'plausible' && analyticsId) {
      this.provider = 'plausible';
      this.plausibleDomain = analyticsId;
      this.enabled = true;
      this.loadPlausible();
    } else if (analyticsProvider === 'posthog' && analyticsId) {
      this.provider = 'posthog';
      this.posthogApiKey = analyticsId;
      this.enabled = true;
      this.loadPostHog();
    } else {
      this.provider = 'none';
      this.enabled = false;
      console.log('[Analytics] Analytics disabled - no provider configured');
    }
  }

  private loadPlausible() {
    if (typeof window === 'undefined') return;

    // Load Plausible script
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = this.plausibleDomain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);

    console.log('[Analytics] Plausible loaded for domain:', this.plausibleDomain);
  }

  private loadPostHog() {
    if (typeof window === 'undefined') return;

    // Load PostHog script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('${this.posthogApiKey}',{api_host:'https://app.posthog.com'})
    `;
    document.head.appendChild(script);

    console.log('[Analytics] PostHog loaded');
  }

  /**
   * Track a custom event
   */
  track(eventName: string, properties?: Record<string, string | number | boolean>) {
    if (!this.enabled) {
      console.debug('[Analytics] Event tracked (disabled):', eventName, properties);
      return;
    }

    try {
      if (this.provider === 'plausible') {
        this.trackPlausible(eventName, properties);
      } else if (this.provider === 'posthog') {
        this.trackPostHog(eventName, properties);
      }
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  }

  private trackPlausible(eventName: string, properties?: Record<string, string | number | boolean>) {
    if (typeof window === 'undefined' || !(window as any).plausible) return;

    // Plausible uses a simple event API
    (window as any).plausible(eventName, {
      props: properties || {},
    });
  }

  private trackPostHog(eventName: string, properties?: Record<string, string | number | boolean>) {
    if (typeof window === 'undefined' || !(window as any).posthog) return;

    // PostHog uses capture method
    (window as any).posthog.capture(eventName, properties || {});
  }

  /**
   * Identify a user (PostHog only - Plausible doesn't track users)
   */
  identify(userId: string, traits?: Record<string, string | number | boolean>) {
    if (!this.enabled || this.provider !== 'posthog') return;

    try {
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.identify(userId, traits);
      }
    } catch (error) {
      console.error('[Analytics] Error identifying user:', error);
    }
  }

  /**
   * Track page view
   */
  page(path: string) {
    if (!this.enabled) return;

    try {
      if (this.provider === 'plausible') {
        // Plausible automatically tracks pageviews
        // But we can manually trigger for SPA navigation
        if (typeof window !== 'undefined' && (window as any).plausible) {
          (window as any).plausible('pageview', {
            url: path,
          });
        }
      } else if (this.provider === 'posthog') {
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('$pageview', {
            $current_url: path,
          });
        }
      }
    } catch (error) {
      console.error('[Analytics] Error tracking pageview:', error);
    }
  }

  /**
   * Set user properties (PostHog only)
   */
  setUserProperties(properties: Record<string, string | number | boolean>) {
    if (!this.enabled || this.provider !== 'posthog') return;

    try {
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.people.set(properties);
      }
    } catch (error) {
      console.error('[Analytics] Error setting user properties:', error);
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current provider
   */
  getProvider(): string {
    return this.provider;
  }
}

export const analytics = new AnalyticsService();
export default analytics;
