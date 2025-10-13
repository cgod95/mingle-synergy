import { useState, useEffect, useRef, useCallback } from 'react';
import logger from '@/utils/Logger';

interface User {
  id: string;
  interests: string[];
  location: { lat: number; lng: number };
  preferences: Record<string, unknown>;
}

interface MatchResult {
  userId: string;
  matchedUserId: string;
  score: number;
  reasons: string[];
}

interface WorkerMessage {
  type: string;
  data: unknown;
  id?: string;
}

export function useMatchingWorker() {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  useEffect(() => {
    if (typeof Window !== 'undefined' && 'Worker' in window) {
      workerRef.current = new Worker(new URL('../workers/matchingWorker.ts', import.meta.url), {
        type: 'module'
      });

      workerRef.current.onmessage = (event) => {
        const { type, matches: workerMatches, processingTime } = event.data;
        
        if (type === 'matchesCalculated') {
          setMatches(workerMatches);
          setIsLoading(false);
          logger.info(`Matching completed in ${processingTime.toFixed(2)}ms`);
        }
      };

      workerRef.current.onerror = (error) => {
        logger.error('Worker error:', error);
        setError('Failed to calculate matches');
        setIsLoading(false);
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Calculate matches
  const calculateMatches = useCallback(async (
    users: User[], 
    currentUserId: string
  ) => {
    if (!workerRef.current) {
      setError('Web Worker not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      workerRef.current.postMessage({
        type: 'calculateMatches',
        users,
        currentUserId,
        startTime: performance.now()
      });
    } catch (err) {
      setError('Failed to start matching calculation');
      setIsLoading(false);
    }
  }, []);

  return {
    calculateMatches,
    matches,
    isLoading,
    error,
    clearError: () => setError(null)
  };
} 