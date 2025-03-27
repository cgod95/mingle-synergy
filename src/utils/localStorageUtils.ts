
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

// Functions for working with matches
export const getMatches = (userId: string): any[] => {
  const matches = localStorage.getItem(`matches_${userId}`);
  return matches ? JSON.parse(matches) : [];
};

export const saveMatches = (userId: string, matches: any[]): void => {
  localStorage.setItem(`matches_${userId}`, JSON.stringify(matches));
};

// Functions for working with interests
export const getInterests = (userId: string): any[] => {
  const interests = localStorage.getItem(`interests_${userId}`);
  return interests ? JSON.parse(interests) : [];
};

export const saveInterests = (userId: string, interests: any[]): void => {
  localStorage.setItem(`interests_${userId}`, JSON.stringify(interests));
};

// Functions for working with liked users
export const getLikedUsers = (userId: string): any[] => {
  const likedUsers = localStorage.getItem(`likedUsers_${userId}`);
  return likedUsers ? JSON.parse(likedUsers) : [];
};

export const saveLikedUsers = (userId: string, likedUsers: any[]): void => {
  localStorage.setItem(`likedUsers_${userId}`, JSON.stringify(likedUsers));
};

export default {
  STORAGE_KEYS,
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearAppStorage,
  localStorageUtils,
  getMatches,
  saveMatches,
  getInterests,
  saveInterests,
  getLikedUsers,
  saveLikedUsers
};
