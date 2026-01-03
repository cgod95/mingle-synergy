// Unit tests for matchesCompat utilities per spec section 12
// Tests: edge timing, rounding down seconds

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isExpired, getRemainingSeconds, MATCH_EXPIRY_MS } from '../matchesCompat';
import type { Match } from '../matchesCompat';

describe('matchesCompat utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isExpired', () => {
    it('should return false for active matches', () => {
      const now = Date.now();
      const match: Match = {
        id: 'm1',
        userId: 'u1',
        partnerId: 'u2',
        createdAt: now - 1000,
        expiresAt: now + MATCH_EXPIRY_MS - 1000,
      };
      expect(isExpired(match)).toBe(false);
    });

    it('should return true for expired matches', () => {
      const now = Date.now();
      const match: Match = {
        id: 'm1',
        userId: 'u1',
        partnerId: 'u2',
        createdAt: now - MATCH_EXPIRY_MS - 1000,
        expiresAt: now - 1000,
      };
      expect(isExpired(match)).toBe(true);
    });

    it('should return true for matches expiring exactly now', () => {
      const now = Date.now();
      const match: Match = {
        id: 'm1',
        userId: 'u1',
        partnerId: 'u2',
        createdAt: now - MATCH_EXPIRY_MS,
        expiresAt: now,
      };
      expect(isExpired(match)).toBe(true);
    });
  });

  describe('getRemainingSeconds', () => {
    it('should return correct seconds for active matches', () => {
      const now = Date.now();
      const match: Match = {
        id: 'm1',
        userId: 'u1',
        partnerId: 'u2',
        createdAt: now - 1000,
        expiresAt: now + 5000, // 5 seconds remaining
      };
      const remaining = getRemainingSeconds(match);
      expect(remaining).toBeGreaterThan(4);
      expect(remaining).toBeLessThanOrEqual(5);
    });

    it('should round down seconds (not up)', () => {
      const now = Date.now();
      const match: Match = {
        id: 'm1',
        userId: 'u1',
        partnerId: 'u2',
        createdAt: now - 1000,
        expiresAt: now + 2500, // 2.5 seconds remaining
      };
      const remaining = getRemainingSeconds(match);
      expect(remaining).toBe(2); // Should round down to 2, not up to 3
    });

    it('should return 0 for expired matches', () => {
      const now = Date.now();
      const match: Match = {
        id: 'm1',
        userId: 'u1',
        partnerId: 'u2',
        createdAt: now - MATCH_EXPIRY_MS - 1000,
        expiresAt: now - 1000,
      };
      expect(getRemainingSeconds(match)).toBe(0);
    });

    it('should return 0 for matches expiring exactly now', () => {
      const now = Date.now();
      const match: Match = {
        id: 'm1',
        userId: 'u1',
        partnerId: 'u2',
        createdAt: now - MATCH_EXPIRY_MS,
        expiresAt: now,
      };
      expect(getRemainingSeconds(match)).toBe(0);
    });

    it('should handle edge case: 1ms remaining', () => {
      const now = Date.now();
      const match: Match = {
        id: 'm1',
        userId: 'u1',
        partnerId: 'u2',
        createdAt: now - 1000,
        expiresAt: now + 1, // 1ms remaining
      };
      const remaining = getRemainingSeconds(match);
      expect(remaining).toBe(0); // Should round down to 0 seconds
    });
  });

  describe('MATCH_EXPIRY_MS constant', () => {
    it('should be exactly 24 hours', () => {
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
      expect(MATCH_EXPIRY_MS).toBe(twentyFourHoursInMs);
    });
  });
});

