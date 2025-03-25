
import { app, auth, db, storage } from './init';
import { getAnalytics } from 'firebase/analytics';

// Initialize analytics separately
let analytics = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.error('Analytics initialization error:', e);
}

// For backward compatibility
const firestore = db;

export { app, auth, db, storage, analytics, firestore };
