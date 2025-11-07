// Analytics event tracking per spec section 9
// Events: user_signed_up, user_checked_in, match_created, message_sent, match_expired, reconnect_requested, reconnect_accepted

import { analytics } from './analytics';

/**
 * Track user sign up event
 * Per spec section 9
 */
export const trackUserSignedUp = (method: string = 'email') => {
  analytics.track('user_signed_up', { method });
};

/**
 * Track user check-in event
 * Per spec section 9
 */
export const trackUserCheckedIn = (venueId: string, venueName: string) => {
  analytics.track('user_checked_in', { venue_id: venueId, venue_name: venueName });
};

/**
 * Track match created event
 * Per spec section 9
 */
export const trackMatchCreated = (matchId: string, userId1: string, userId2: string, venueId: string) => {
  analytics.track('match_created', {
    match_id: matchId,
    user_id_1: userId1,
    user_id_2: userId2,
    venue_id: venueId,
  });
};

/**
 * Track message sent event
 * Per spec section 9
 */
export const trackMessageSent = (matchId: string, senderId: string, messageLength: number) => {
  analytics.track('message_sent', {
    match_id: matchId,
    sender_id: senderId,
    message_length: messageLength,
  });
};

/**
 * Track match expired event
 * Per spec section 9
 */
export const trackMatchExpired = (matchId: string, userId1: string, userId2: string) => {
  analytics.track('match_expired', {
    match_id: matchId,
    user_id_1: userId1,
    user_id_2: userId2,
  });
};

/**
 * Track reconnect requested event
 * Per spec section 9
 */
export const trackReconnectRequested = (matchId: string, requesterId: string) => {
  analytics.track('reconnect_requested', {
    match_id: matchId,
    requester_id: requesterId,
  });
};

/**
 * Track reconnect accepted event
 * Per spec section 9
 */
export const trackReconnectAccepted = (matchId: string, userId1: string, userId2: string) => {
  analytics.track('reconnect_accepted', {
    match_id: matchId,
    user_id_1: userId1,
    user_id_2: userId2,
  });
};

/**
 * Track KPI metrics per spec section 9
 * DAU, check-in → match rate, match → chat rate, avg time to first interaction, session time, churn after first week
 */

/**
 * Track daily active user
 */
export const trackDAU = (userId: string) => {
  analytics.track('dau', { user_id: userId, date: new Date().toISOString().split('T')[0] });
};

/**
 * Track check-in to match conversion
 */
export const trackCheckInToMatchRate = (venueId: string, hasMatch: boolean) => {
  analytics.track('checkin_to_match_rate', {
    venue_id: venueId,
    has_match: hasMatch,
  });
};

/**
 * Track match to chat conversion
 */
export const trackMatchToChatRate = (matchId: string, hasMessage: boolean) => {
  analytics.track('match_to_chat_rate', {
    match_id: matchId,
    has_message: hasMessage,
  });
};

/**
 * Track time to first interaction
 */
export const trackTimeToFirstInteraction = (matchId: string, timeMs: number) => {
  analytics.track('time_to_first_interaction', {
    match_id: matchId,
    time_ms: timeMs,
  });
};

/**
 * Track session time
 */
export const trackSessionTime = (sessionDurationMs: number) => {
  analytics.track('session_time', {
    duration_ms: sessionDurationMs,
  });
};

/**
 * Track churn after first week
 */
export const trackChurnAfterFirstWeek = (userId: string, daysSinceSignup: number) => {
  if (daysSinceSignup >= 7) {
    analytics.track('churn_after_first_week', {
      user_id: userId,
      days_since_signup: daysSinceSignup,
    });
  }
};

export default {
  trackUserSignedUp,
  trackUserCheckedIn,
  trackMatchCreated,
  trackMessageSent,
  trackMatchExpired,
  trackReconnectRequested,
  trackReconnectAccepted,
  trackDAU,
  trackCheckInToMatchRate,
  trackMatchToChatRate,
  trackTimeToFirstInteraction,
  trackSessionTime,
  trackChurnAfterFirstWeek,
};

