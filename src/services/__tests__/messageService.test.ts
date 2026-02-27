import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isFirestoreIndexError, subscribeToMessages } from '../messageService';

const mockOnSnapshot = vi.fn();

vi.mock('@/firebase/config', () => ({
  firestore: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limitToLast: vi.fn(),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
}));

describe('messageService', () => {
  describe('isFirestoreIndexError', () => {
    it('returns true for failed-precondition code', () => {
      expect(isFirestoreIndexError({ code: 'failed-precondition' })).toBe(true);
    });

    it('returns true when message contains "index"', () => {
      expect(isFirestoreIndexError({ message: 'The query requires an index' })).toBe(true);
      expect(isFirestoreIndexError({ message: 'index not found' })).toBe(true);
    });

    it('returns true when message contains "requires an index"', () => {
      expect(isFirestoreIndexError({ message: 'requires an index to run' })).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(isFirestoreIndexError({ code: 'permission-denied' })).toBe(false);
      expect(isFirestoreIndexError({ message: 'Network error' })).toBe(false);
      expect(isFirestoreIndexError(null)).toBe(false);
      expect(isFirestoreIndexError(undefined)).toBe(false);
    });
  });

  describe('subscribeToMessages', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockOnSnapshot.mockReset();
    });

    it('calls onError when subscription fails with index error after retries exhausted', async () => {
      const onError = vi.fn();
      const callback = vi.fn();

      mockOnSnapshot.mockImplementation((_q: unknown, _onSuccess: () => void, onErr: (e: unknown) => void) => {
        setTimeout(() => onErr({ code: 'failed-precondition', message: 'The query requires an index' }), 0);
        return () => {};
      });

      subscribeToMessages('match-1', callback, {
        messageLimit: 50,
        onError,
        maxRetries: 0,
        retryDelays: [],
      });

      await new Promise((r) => setTimeout(r, 100));

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('returns unsubscribe function that cleans up', () => {
      const unsubFn = vi.fn();
      mockOnSnapshot.mockReturnValue(unsubFn);

      const unsubscribe = subscribeToMessages('match-1', () => {}, 50);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
      expect(unsubFn).toHaveBeenCalled();
    });
  });
});
