import { NavigateFunction } from 'react-router-dom';

/**
 * Safely navigate back with a fallback route.
 * 
 * This handles edge cases where navigate(-1) fails:
 * - Deep linking (user navigated directly to page)
 * - Opening links in new tabs (no browser history)
 * - Previous page was outside the app
 * 
 * @param navigate - React Router's navigate function
 * @param fallback - Route to navigate to if there's no history
 */
export const goBackSafely = (navigate: NavigateFunction, fallback: string): void => {
  // Check if there's meaningful history to go back to
  // history.length > 2 because: initial page (1) + current page (2)
  // We use > 2 to be safe, ensuring there's at least one page to go back to
  if (window.history.length > 2) {
    navigate(-1);
  } else {
    navigate(fallback, { replace: true });
  }
};

/**
 * Create a back handler with a specific fallback.
 * Useful for onClick handlers.
 * 
 * @param navigate - React Router's navigate function
 * @param fallback - Route to navigate to if there's no history
 * @returns A function that can be used as an onClick handler
 */
export const createBackHandler = (navigate: NavigateFunction, fallback: string) => {
  return () => goBackSafely(navigate, fallback);
};

