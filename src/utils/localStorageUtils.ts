
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

// Typed helpers for specific data types
export const saveInterests = (interests: any[]): void => {
  saveToStorage(STORAGE_KEYS.INTERESTS, interests);
};

export const getInterests = (): any[] => {
  return getFromStorage(STORAGE_KEYS.INTERESTS, []);
};

export const saveMatches = (matches: any[]): void => {
  saveToStorage(STORAGE_KEYS.MATCHES, matches);
};

export const getMatches = (): any[] => {
  return getFromStorage(STORAGE_KEYS.MATCHES, []);
};

export const saveLikedUsers = (likedUsers: string[]): void => {
  saveToStorage(STORAGE_KEYS.LIKED_USERS, likedUsers);
};

export const getLikedUsers = (): string[] => {
  return getFromStorage(STORAGE_KEYS.LIKED_USERS, []);
};

export const saveUserMessages = (messages: Record<string, string>): void => {
  saveToStorage(STORAGE_KEYS.USER_MESSAGES, messages);
};

export const getUserMessages = (): Record<string, string> => {
  return getFromStorage(STORAGE_KEYS.USER_MESSAGES, {});
};

export const saveCheckedInVenue = (venueId: string | null): void => {
  saveToStorage(STORAGE_KEYS.CHECKED_IN_VENUE, venueId);
};

export const getCheckedInVenue = (): string | null => {
  return getFromStorage(STORAGE_KEYS.CHECKED_IN_VENUE, null);
};

export default {
  STORAGE_KEYS,
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearAppStorage,
  saveInterests,
  getInterests,
  saveMatches,
  getMatches,
  saveLikedUsers,
  getLikedUsers,
  saveUserMessages,
  getUserMessages,
  saveCheckedInVenue,
  getCheckedInVenue,
};
