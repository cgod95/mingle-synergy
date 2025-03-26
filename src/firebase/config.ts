
import { app, auth, db, storage } from './init';
import { getAnalytics } from 'firebase/analytics';

// Initialize analytics separately
let analytics = null;
try {
  if (typeof window !== 'undefined' && Object.keys(app).length > 0) {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.error('Analytics initialization error:', e);
}

// For backward compatibility
const firestore = db;

// Export mock status for service determination
const isMock = Object.keys(app).length === 0;

export { app, auth, db, storage, analytics, firestore, isMock };
