// Demo Free Access Window Utilities
// Manages time-bounded free access for demo mode

import config from '@/config';

export interface DemoFreeWindow {
  isActive: boolean;
  expiresAt: number | null;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
}

/**
 * Check if demo free access window is currently active
 * @param now Optional timestamp (defaults to current time)
 */
export function isDemoFreeActive(now: number = Date.now()): boolean {
  if (!config.DEMO_MODE) return false;
  
  const expiryDate = getDemoFreeExpiry();
  if (!expiryDate) return true; // No expiry set = always active in demo mode
  
  return now < expiryDate.getTime();
}

/**
 * Get the expiry date for demo free access window
 * Supports two env var formats:
 * - VITE_DEMO_FREE_ACCESS_UNTIL: ISO date string (e.g., "2025-12-31T23:59:59Z")
 * - VITE_DEMO_FREE_ACCESS_DAYS: Number of days from now (e.g., "7" for 7 days)
 */
export function getDemoFreeExpiry(): Date | null {
  if (!config.DEMO_MODE) return null;
  
  const untilEnv = import.meta.env.VITE_DEMO_FREE_ACCESS_UNTIL;
  const daysEnv = import.meta.env.VITE_DEMO_FREE_ACCESS_DAYS;
  
  if (untilEnv) {
    const date = new Date(untilEnv);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  if (daysEnv) {
    const days = parseInt(daysEnv, 10);
    if (!isNaN(days) && days > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      return expiry;
    }
  }
  
  // Default: 7 days from now if no env var set
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 7);
  return defaultExpiry;
}

/**
 * Get detailed demo free access window status
 */
export function getDemoFreeWindow(now: number = Date.now()): DemoFreeWindow {
  const expiryDate = getDemoFreeExpiry();
  const isActive = expiryDate ? now < expiryDate.getTime() : config.DEMO_MODE;
  
  if (!expiryDate || !isActive) {
    return {
      isActive: false,
      expiresAt: null,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
    };
  }
  
  const remaining = expiryDate.getTime() - now;
  const daysRemaining = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    isActive: true,
    expiresAt: expiryDate.getTime(),
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
  };
}

/**
 * Format remaining time as human-readable string
 */
export function formatDemoFreeRemaining(window: DemoFreeWindow): string {
  if (!window.isActive) return 'Expired';
  
  if (window.daysRemaining > 0) {
    return `${window.daysRemaining}d ${window.hoursRemaining}h`;
  }
  if (window.hoursRemaining > 0) {
    return `${window.hoursRemaining}h ${window.minutesRemaining}m`;
  }
  return `${window.minutesRemaining}m`;
}




