
/**
 * Storage utility to handle persisting app data in localStorage
 */

// Constants for storage keys
const STORAGE_KEYS = {
  INTERESTS: 'interests',
  MATCHES: 'matches',
  USER_MESSAGES: 'userMessages',
  CURRENT_USER: 'currentUser',
  LIKED_USERS: 'likedUsers',
  CHECKED_IN_VENUE: 'checkedInVenue',
};

/**
 * Save data to localStorage with proper error handling
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Get data from localStorage with proper type casting and error handling
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) as T : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all app-related data from localStorage
 */
export const clearAppStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing app storage:', error);
  }
};

// Simple wrapper for older code
export const localStorageUtils = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  },
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }
};

export default {
  STORAGE_KEYS,
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearAppStorage,
  localStorageUtils
};
