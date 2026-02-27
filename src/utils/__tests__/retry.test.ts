import { describe, it, expect, vi } from 'vitest';
import { isRetryableError, isNetworkError } from '../retry';

describe('retry utilities', () => {
  describe('isNetworkError', () => {
    it('returns true for TypeError with network message', () => {
      expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
      expect(isNetworkError(new TypeError('network error'))).toBe(true);
    });

    it('returns true for Error with network-related message', () => {
      expect(isNetworkError(new Error('NetworkError'))).toBe(true);
      expect(isNetworkError(new Error('request timeout'))).toBe(true);
    });

    it('returns false for unrelated errors', () => {
      expect(isNetworkError(new Error('Something else'))).toBe(false);
      expect(isNetworkError(new Error('permission denied'))).toBe(false);
    });
  });

  describe('isRetryableError', () => {
    it('returns true for network errors', () => {
      expect(isRetryableError(new TypeError('Failed to fetch'))).toBe(true);
    });

    it('returns true for Firebase unavailable', () => {
      expect(isRetryableError({ code: 'unavailable' })).toBe(true);
    });

    it('returns true for Firebase deadline-exceeded', () => {
      expect(isRetryableError({ code: 'deadline-exceeded' })).toBe(true);
    });

    it('returns true for Firebase failed-precondition (index building)', () => {
      expect(isRetryableError({ code: 'failed-precondition' })).toBe(true);
    });

    it('returns true for Firebase internal', () => {
      expect(isRetryableError({ code: 'internal' })).toBe(true);
    });

    it('returns true for Firebase aborted', () => {
      expect(isRetryableError({ code: 'aborted' })).toBe(true);
    });

    it('returns false for permission-denied', () => {
      expect(isRetryableError({ code: 'permission-denied' })).toBe(false);
    });

    it('returns false for not-found', () => {
      expect(isRetryableError({ code: 'not-found' })).toBe(false);
    });

    it('returns false for invalid-argument', () => {
      expect(isRetryableError({ code: 'invalid-argument' })).toBe(false);
    });
  });
});
