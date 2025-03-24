
import { getApp, getApps } from 'firebase/app';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';

// Simple wrapper for analytics events with error handling
const logAnalyticsEvent = (eventName: string, eventParams: Record<string, any> = {}): void => {
  try {
    // Only attempt to use analytics if Firebase is initialized
    if (getApps().length) {
      const app = getApp();
      const analytics = getAnalytics(app);
      logEvent(analytics, eventName, eventParams);
    }
  } catch (error) {
    console.warn(`Failed to log analytics event: ${eventName}`, error);
  }
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
export const trackError = (errorCode: string, errorMessage: string, additionalData: Record<string, any> = {}): void => 
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
