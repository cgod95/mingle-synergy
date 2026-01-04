/**
 * Centralized App Constants
 * Single source of truth for all magic numbers and configuration values
 * 
 * IMPORTANT: All time-based constants should be defined here to avoid inconsistencies
 */

export const APP_CONSTANTS = {
  // Match settings
  MATCH_EXPIRY_HOURS: 24,
  MATCH_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  // Check-in settings  
  CHECKIN_EXPIRY_HOURS: 12,
  CHECKIN_EXPIRY_MS: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
  
  // Message settings
  DEFAULT_MESSAGE_LIMIT: 10,
  
  // Cache settings
  MATCHES_CACHE_TTL_MS: 30000, // 30 seconds
  MATCHES_REFRESH_INTERVAL_MS: 60000, // 60 seconds
  
  // UI settings
  EXPIRY_WARNING_THRESHOLD_HOURS: 1, // Show warning when < 1 hour remaining
  EXPIRY_CRITICAL_THRESHOLD_MINUTES: 30, // Show critical warning when < 30 min
} as const;

// Type-safe accessor for constants
export type AppConstantsKey = keyof typeof APP_CONSTANTS;

// Helper function to get constant value
export function getConstant<K extends AppConstantsKey>(key: K): typeof APP_CONSTANTS[K] {
  return APP_CONSTANTS[key];
}





