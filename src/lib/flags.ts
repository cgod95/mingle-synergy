// Feature flags for Mingle MVP
// All flags are read synchronously and can be toggled via environment variables
// DEMO MODE: Photo requirement disabled for easier testing

import { APP_CONSTANTS } from '@/constants/app';

export const FEATURE_FLAGS = {
  // Chat & Messaging
  UNLOCK_FULL_CHAT_ON_COLOCATION: import.meta.env.VITE_UNLOCK_FULL_CHAT_ON_COLOCATION !== 'false', // default: ON
  ALLOW_REMOTE_RECONNECT_CHAT: import.meta.env.VITE_ALLOW_REMOTE_RECONNECT_CHAT === 'true', // default: OFF
  // BETA FIX: Only check VITE_DEMO_MODE, not development mode
  LIMIT_MESSAGES_PER_USER: import.meta.env.VITE_DEMO_MODE === 'true'
    ? -1 // Unlimited in demo mode
    : parseInt(import.meta.env.VITE_LIMIT_MESSAGES_PER_USER || String(APP_CONSTANTS.DEFAULT_MESSAGE_LIMIT), 10), // default from constants

  // UI & Privacy
  BLUR_PHOTOS_UNTIL_MATCH: import.meta.env.VITE_BLUR_PHOTOS_UNTIL_MATCH === 'true', // default: OFF
  STRICT_PHOTO_REQUIRED_FOR_CHECKIN: import.meta.env.VITE_STRICT_PHOTO_REQUIRED_FOR_CHECKIN === 'true', // default: OFF for demo

  // Reconnect Flow
  RECONNECT_FLOW_ENABLED: import.meta.env.VITE_RECONNECT_FLOW_ENABLED !== 'false', // default: ON

  // Notifications
  PUSH_NOTIFICATIONS_ENABLED: import.meta.env.VITE_PUSH_NOTIFICATIONS_ENABLED === 'true', // default: OFF for MVP

  // Offline Mode
  OFFLINE_MODE_ENABLED: import.meta.env.VITE_OFFLINE_MODE_ENABLED === 'true', // default: OFF

  // Debug & Development
  DEBUG_ROUTES_ENABLED: import.meta.env.VITE_DEBUG_ROUTES_ENABLED === 'true' || import.meta.env.DEV, // default: OFF in production
} as const;

// Helper to check if a feature is enabled
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  const value = FEATURE_FLAGS[flag];
  return typeof value === 'boolean' ? value : value > 0;
}

// Helper to get numeric flag value
export function getFeatureValue(flag: keyof typeof FEATURE_FLAGS): number | boolean {
  return FEATURE_FLAGS[flag];
}



