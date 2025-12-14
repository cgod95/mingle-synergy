/**
 * Navigation utility functions for safe navigation with fallbacks
 */
import { NavigateFunction } from 'react-router-dom';

/**
 * Safely navigate back with fallback to a default route
 * @param navigate - React Router navigate function
 * @param fallbackRoute - Route to navigate to if no history exists (default: '/')
 */
export function safeNavigateBack(navigate: NavigateFunction, fallbackRoute: string = '/'): void {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallbackRoute);
  }
}



