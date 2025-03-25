
// Simple fetch wrapper for data fetching without React Query
export const fetcher = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return response.json();
};

// Example hook for data fetching
export const useFetch = <T,>(url: string): { data: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher(url);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [url]);
  
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const refetch = React.useCallback(async () => {
    await fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch };
};
