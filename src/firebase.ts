// Re-export everything from firebase/config for consistency
// This ensures all imports from '@/firebase' and '@/firebase/config' use the same initialization
export { app, auth, db, firestore, storage } from './firebase/config';
