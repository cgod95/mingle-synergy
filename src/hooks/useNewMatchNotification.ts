/**
 * Hook for new match notifications
 * 
 * Tracks new matches and provides state for showing match popup
 */

import { useState, useCallback, useEffect } from 'react';

export interface NewMatchData {
  matchId: string;
  partnerName: string;
  partnerPhoto?: string;
  venueName?: string;
}

// Global state to track pending matches
let pendingMatch: NewMatchData | null = null;
const listeners: Set<(match: NewMatchData | null) => void> = new Set();

/**
 * Trigger a new match notification
 * Can be called from anywhere (e.g., matchService)
 */
export function triggerNewMatchNotification(match: NewMatchData): void {
  pendingMatch = match;
  listeners.forEach(listener => listener(match));
}

/**
 * Clear the current match notification
 */
export function clearMatchNotification(): void {
  pendingMatch = null;
  listeners.forEach(listener => listener(null));
}

/**
 * Hook to consume new match notifications
 */
export function useNewMatchNotification() {
  const [currentMatch, setCurrentMatch] = useState<NewMatchData | null>(pendingMatch);
  const [isModalOpen, setIsModalOpen] = useState(!!pendingMatch);

  useEffect(() => {
    const listener = (match: NewMatchData | null) => {
      setCurrentMatch(match);
      setIsModalOpen(!!match);
    };
    
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    clearMatchNotification();
  }, []);

  const showMatch = useCallback((match: NewMatchData) => {
    triggerNewMatchNotification(match);
  }, []);

  return {
    currentMatch,
    isModalOpen,
    closeModal,
    showMatch
  };
}

export default useNewMatchNotification;






