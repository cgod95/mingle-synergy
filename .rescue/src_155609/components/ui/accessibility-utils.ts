import { useEffect } from 'react';

// Keyboard navigation hook
export const useKeyboardNavigation = (onEnter?: () => void, onEscape?: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && onEnter) {
        e.preventDefault();
        onEnter();
      } else if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape]);
};

// ARIA label generator for common actions
export const getAriaLabel = {
  like: (name: string) => `Like ${name}`,
  unlike: (name: string) => `Unlike ${name}`,
  message: (name: string) => `Send message to ${name}`,
  viewProfile: (name: string) => `View ${name}'s profile`,
  checkIn: (venue: string) => `Check in to ${venue}`,
  checkOut: (venue: string) => `Check out of ${venue}`,
  markAsRead: (name: string) => `Mark message from ${name} as read`,
  delete: (item: string) => `Delete ${item}`,
  edit: (item: string) => `Edit ${item}`,
  close: () => 'Close',
  open: (item: string) => `Open ${item}`,
  navigate: (page: string) => `Navigate to ${page}`,
  search: () => 'Search',
  filter: (type: string) => `Filter by ${type}`,
  sort: (type: string) => `Sort by ${type}`,
  loadMore: () => 'Load more items',
  refresh: () => 'Refresh content',
  share: (item: string) => `Share ${item}`,
  report: (item: string) => `Report ${item}`,
  block: (name: string) => `Block ${name}`,
  unblock: (name: string) => `Unblock ${name}`,
}; 