import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  dependencies?: unknown[];
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions<T> = {}
) {
  const { onSuccess, onError, enabled = true, dependencies = [] } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);
  
  // Create a stable dependency array
  const stableDependencies = useMemo(() => dependencies, [dependencies]);
  
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData, stableDependencies]);
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}
