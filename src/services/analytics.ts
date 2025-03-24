
import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

// User events
export const trackUserSignUp = (method: string): void => {
  if (analytics) {
    logEvent(analytics, 'sign_up', { method });
  }
};

export const trackUserLogin = (method: string): void => {
  if (analytics) {
    logEvent(analytics, 'login', { method });
  }
};

// App usage events
export const trackVenueCheckIn = (venueId: string, venueName: string): void => {
  if (analytics) {
    logEvent(analytics, 'venue_check_in', { 
      venue_id: venueId,
      venue_name: venueName
    });
  }
};

export const trackVenueCheckOut = (venueId: string, venueName: string, durationMinutes: number): void => {
  if (analytics) {
    logEvent(analytics, 'venue_check_out', { 
      venue_id: venueId,
      venue_name: venueName,
      duration_minutes: durationMinutes
    });
  }
};

export const trackInterestSent = (venueId: string): void => {
  if (analytics) {
    logEvent(analytics, 'interest_sent', { venue_id: venueId });
  }
};

export const trackMatchCreated = (venueId: string): void => {
  if (analytics) {
    logEvent(analytics, 'match_created', { venue_id: venueId });
  }
};

export const trackContactShared = (matchId: string): void => {
  if (analytics) {
    logEvent(analytics, 'contact_shared', { match_id: matchId });
  }
};

// Error tracking
export const trackError = (errorCode: string, errorMessage: string, additionalData?: Record<string, any>): void => {
  if (analytics) {
    logEvent(analytics, 'app_error', {
      error_code: errorCode,
      error_message: errorMessage,
      ...(additionalData || {})
    });
  }
};

// Screen tracking
export const trackScreenView = (screenName: string): void => {
  if (analytics) {
    logEvent(analytics, 'screen_view', { screen_name: screenName });
  }
};
