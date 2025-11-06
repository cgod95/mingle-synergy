import { useState, useCallback, useRef } from 'react';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, originalData: T) => void;
  onSettled?: () => void;
  rollbackOnError?: boolean;
}

interface OptimisticUpdateState<T> {
  data: T;
  isUpdating: boolean;
  error: Error | null;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [state, setState] = useState<OptimisticUpdateState<T>>({
    data: initialData,
    isUpdating: false,
    error: null,
  });

  const originalDataRef = useRef<T>(initialData);
  const pendingUpdatesRef = useRef<Promise<T>[]>([]);

  const updateOptimistically = useCallback(
    async (
      optimisticData: T,
      updatePromise: Promise<T>,
      shouldRollback = true
    ) => {
      // Store original data for potential rollback
      const originalData = state.data;
      originalDataRef.current = originalData;

      // Apply optimistic update immediately
      setState(prev => ({
        ...prev,
        data: optimisticData,
        isUpdating: true,
        error: null,
      }));

      try {
        // Wait for the actual update
        const result = await updatePromise;
        
        // Update with the real data
        setState(prev => ({
          ...prev,
          data: result,
          isUpdating: false,
        }));

        options.onSuccess?.(result);
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Update failed');
        
        if (shouldRollback) {
          // Rollback to original data
          setState(prev => ({
            ...prev,
            data: originalData,
            isUpdating: false,
            error: errorObj,
          }));
        } else {
          // Keep optimistic data but show error
          setState(prev => ({
            ...prev,
            isUpdating: false,
            error: errorObj,
          }));
        }

        options.onError?.(errorObj, originalData);
        throw error;
      } finally {
        options.onSettled?.();
      }
    },
    [state.data, options]
  );

  const batchUpdate = useCallback(
    async (updates: Array<{ optimistic: T; promise: Promise<T> }>) => {
      const originalData = state.data;
      originalDataRef.current = originalData;

      // Apply all optimistic updates
      const optimisticData = updates.reduce((acc, update) => update.optimistic, state.data);
      
      setState(prev => ({
        ...prev,
        data: optimisticData,
        isUpdating: true,
        error: null,
      }));

      try {
        // Execute all updates
        const results = await Promise.all(updates.map(u => u.promise));
        const finalResult = results[results.length - 1]; // Use last result as final state

        setState(prev => ({
          ...prev,
          data: finalResult,
          isUpdating: false,
        }));

        options.onSuccess?.(finalResult);
        return results;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Batch update failed');
        
        // Rollback to original data
        setState(prev => ({
          ...prev,
          data: originalData,
          isUpdating: false,
          error: errorObj,
        }));

        options.onError?.(errorObj, originalData);
        throw error;
      } finally {
        options.onSettled?.();
      }
    },
    [state.data, options]
  );

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback((newData: T) => {
    setState({
      data: newData,
      isUpdating: false,
      error: null,
    });
    originalDataRef.current = newData;
  }, []);

  return {
    data: state.data,
    isUpdating: state.isUpdating,
    error: state.error,
    updateOptimistically,
    batchUpdate,
    clearError,
    reset,
    originalData: originalDataRef.current,
  };
}

// Specialized hook for like/unlike operations
export function useOptimisticLike() {
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  const likeOptimistically = useCallback(
    async (itemId: string, likePromise: Promise<boolean>) => {
      // Optimistically add to liked items
      setLikedItems(prev => new Set(prev).add(itemId));
      setPendingLikes(prev => new Set(prev).add(itemId));

      try {
        const result = await likePromise;
        if (!result) {
          // If the API call failed, remove from liked items
          setLikedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
        }
        return result;
      } catch (error) {
        // Rollback on error
        setLikedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        throw error;
      } finally {
        setPendingLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    []
  );

  const unlikeOptimistically = useCallback(
    async (itemId: string, unlikePromise: Promise<boolean>) => {
      // Optimistically remove from liked items
      setLikedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      setPendingLikes(prev => new Set(prev).add(itemId));

      try {
        const result = await unlikePromise;
        if (!result) {
          // If the API call failed, add back to liked items
          setLikedItems(prev => new Set(prev).add(itemId));
        }
        return result;
      } catch (error) {
        // Rollback on error
        setLikedItems(prev => new Set(prev).add(itemId));
        throw error;
      } finally {
        setPendingLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    []
  );

  return {
    likedItems,
    pendingLikes,
    likeOptimistically,
    unlikeOptimistically,
    isLiked: (itemId: string) => likedItems.has(itemId),
    isPending: (itemId: string) => pendingLikes.has(itemId),
  };
}

// Specialized hook for match operations
export function useOptimisticMatch() {
  const [matches, setMatches] = useState<Map<string, unknown>>(new Map());
  const [pendingMatches, setPendingMatches] = useState<Set<string>>(new Set());

  const addMatchOptimistically = useCallback(
    async (matchId: string, matchData: unknown, addPromise: Promise<unknown>) => {
      // Optimistically add match
      setMatches(prev => new Map(prev).set(matchId, matchData));
      setPendingMatches(prev => new Set(prev).add(matchId));

      try {
        const result = await addPromise;
        // Update with real data
        setMatches(prev => new Map(prev).set(matchId, result));
        return result;
      } catch (error) {
        // Rollback on error
        setMatches(prev => {
          const newMap = new Map(prev);
          newMap.delete(matchId);
          return newMap;
        });
        throw error;
      } finally {
        setPendingMatches(prev => {
          const newSet = new Set(prev);
          newSet.delete(matchId);
          return newSet;
        });
      }
    },
    []
  );

  return {
    matches: Array.from(matches.values()),
    pendingMatches,
    addMatchOptimistically,
    isPending: (matchId: string) => pendingMatches.has(matchId),
  };
} 