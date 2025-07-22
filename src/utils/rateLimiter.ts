// 🧠 Purpose: Rate limiting utility to prevent spam and abuse
import logger from '@/utils/Logger';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (userId: string, action: string) => string;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequestTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Set up default rate limit configurations
    this.setupDefaultConfigs();
  }

  private setupDefaultConfigs(): void {
    // Like actions - 10 likes per minute
    this.setConfig('like', {
      maxRequests: 10,
      windowMs: 60 * 1000,
    });

    // Message actions - 20 messages per minute
    this.setConfig('message', {
      maxRequests: 20,
      windowMs: 60 * 1000,
    });

    // Check-in actions - 5 check-ins per hour
    this.setConfig('checkin', {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    // Verification attempts - 3 attempts per hour
    this.setConfig('verification', {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
    });

    // Reconnect requests - 5 requests per day
    this.setConfig('reconnect', {
      maxRequests: 5,
      windowMs: 24 * 60 * 60 * 1000,
    });

    // Profile updates - 10 updates per hour
    this.setConfig('profile_update', {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });
  }

  setConfig(action: string, config: RateLimitConfig): void {
    this.configs.set(action, config);
  }

  private generateKey(userId: string, action: string): string {
    return `${userId}:${action}`;
  }

  isRateLimited(userId: string, action: string): boolean {
    const config = this.configs.get(action);
    if (!config) {
      logger.warn('No rate limit config found for action', { action });
      return false;
    }

    const key = this.generateKey(userId, action);
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      // First request
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        lastRequestTime: now,
      });
      return false;
    }

    // Check if window has reset
    if (now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        lastRequestTime: now,
      });
      return false;
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      logger.warn('Rate limit exceeded', { userId, action, count: entry.count, maxRequests: config.maxRequests });
      return true;
    }

    // Increment counter
    entry.count++;
    entry.lastRequestTime = now;
    this.limits.set(key, entry);

    return false;
  }

  getRemainingRequests(userId: string, action: string): number {
    const config = this.configs.get(action);
    if (!config) return 0;

    const key = this.generateKey(userId, action);
    const entry = this.limits.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - entry.count);
  }

  getResetTime(userId: string, action: string): number {
    const key = this.generateKey(userId, action);
    const entry = this.limits.get(key);
    return entry?.resetTime || 0;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  // Reset rate limit for a specific user and action
  reset(userId: string, action: string): void {
    const key = this.generateKey(userId, action);
    this.limits.delete(key);
    logger.info('Rate limit reset', { userId, action });
  }

  // Get all active rate limits for a user
  getUserLimits(userId: string): Record<string, { remaining: number; resetTime: number }> {
    const userLimits: Record<string, { remaining: number; resetTime: number }> = {};
    
    for (const [action] of this.configs.keys()) {
      userLimits[action] = {
        remaining: this.getRemainingRequests(userId, action),
        resetTime: this.getResetTime(userId, action),
      };
    }

    return userLimits;
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

export default rateLimiter;

// Usage examples:
/*
// Check if user can like someone
if (rateLimiter.isRateLimited(userId, 'like')) {
  throw new Error('Rate limit exceeded for likes');
}

// Check if user can send a message
if (rateLimiter.isRateLimited(userId, 'message')) {
  throw new Error('Too many messages sent');
}

// Check if user can check in to a venue
if (rateLimiter.isRateLimited(userId, 'checkin')) {
  throw new Error('Too many check-ins');
}

// Get remaining requests
const remainingLikes = rateLimiter.getRemainingRequests(userId, 'like');
const resetTime = rateLimiter.getResetTime(userId, 'like');
*/ 