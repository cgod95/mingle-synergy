import { app } from '../firebase/init';

// Simple wrapper for analytics events with error handling
const logAnalyticsEvent = (eventName: string, eventParams: Record<string, string | number | boolean> = {}): void => {
  // Skip analytics if we're using mock services
  if (Object.keys(app).length === 0) {
    console.log(`[MOCK ANALYTICS] ${eventName}`, eventParams);
    return;
  }
  
  // Comment out Firebase Analytics for emulator use
  console.log(`[ANALYTICS DISABLED] ${eventName}`, eventParams);
  
  // try {
  //   // Get analytics instance and logEvent function dynamically to avoid circular dependencies
  //   import('firebase/analytics').then((analyticsModule) => {
  //     const { getAnalytics, logEvent } = analyticsModule;
  //     const analytics = getAnalytics(app);
  //     if (analytics) {
  //       logEvent(analytics, eventName, eventParams);
  //     }
  //   }).catch(e => {
  //     console.warn(`Failed to load analytics module: ${e.message}`);
  //   });
  // } catch (error) {
  //   console.warn(`Failed to log analytics event: ${eventName}`, error);
  // }
};

// User events
export const trackUserSignUp = (method: string): void => 
  logAnalyticsEvent('sign_up', { method });

export const trackUserLogin = (method: string): void => 
  logAnalyticsEvent('login', { method });

// App usage events
export const trackVenueCheckIn = (venueId: string, venueName: string): void => 
  logAnalyticsEvent('venue_check_in', { 
    venue_id: venueId, 
    venue_name: venueName 
  });

export const trackVenueCheckOut = (venueId: string, venueName: string, durationMinutes?: number): void => 
  logAnalyticsEvent('venue_check_out', { 
    venue_id: venueId, 
    venue_name: venueName,
    ...(durationMinutes !== undefined ? { duration_minutes: durationMinutes } : {})
  });

export const trackInterestSent = (venueId: string): void => 
  logAnalyticsEvent('interest_sent', { venue_id: venueId });

export const trackMatchCreated = (venueId: string): void => 
  logAnalyticsEvent('match_created', { venue_id: venueId });

export const trackContactShared = (matchId: string): void => 
  logAnalyticsEvent('contact_shared', { match_id: matchId });

// Error tracking
export const trackError = (errorCode: string, errorMessage: string, additionalData: Record<string, string | number | boolean> = {}): void => 
  logAnalyticsEvent('app_error', {
    error_code: errorCode,
    error_message: errorMessage,
    ...additionalData
  });

// Screen tracking
export const trackScreenView = (screenName: string): void => 
  logAnalyticsEvent('screen_view', { screen_name: screenName });

export default { 
  trackUserSignUp, 
  trackUserLogin, 
  trackVenueCheckIn, 
  trackVenueCheckOut,
  trackInterestSent,
  trackMatchCreated,
  trackContactShared,
  trackError,
  trackScreenView
};
