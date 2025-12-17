/**
 * Safe Firebase access utilities
 * Re-exports from config.ts to ensure single source of truth
 */
import { app, auth, firestore, storage } from './config';

// Re-export the instances with null checks
export const getDB = () => firestore;
export const getAUTH = () => auth;
export const getSTORAGE = () => storage;

// Check if Firebase is available (app is initialized)
export const isFirebaseAvailable = (): boolean => {
  return !!app && !!firestore;
};
