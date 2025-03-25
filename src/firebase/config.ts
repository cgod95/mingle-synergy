
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { logError } from '@/utils/errorHandler';

// Define a singleton class to manage Firebase instance
class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private _auth: Auth;
  private _db: Firestore;
  private _storage: FirebaseStorage;
  private _analytics: Analytics | null = null;
  
  private constructor() {
    try {
      // Your Firebase configuration
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      };
      
      // Check if Firebase app has already been initialized
      if (!getApps().length) {
        console.log('Initializing Firebase app');
        this.app = initializeApp(firebaseConfig);
      } else {
        console.log('Using existing Firebase app');
        this.app = getApp();
      }
      
      // Initialize services
      this._auth = getAuth(this.app);
      this._db = getFirestore(this.app);
      this._storage = getStorage(this.app);
      
      // Only initialize analytics in browser environment
      if (typeof window !== 'undefined') {
        this._analytics = getAnalytics(this.app);
      }
      
      // Enable offline persistence for better mobile experience
      if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(this._db)
          .catch((err) => {
            const errorMessage = err.code === 'failed-precondition' 
              ? 'Multiple tabs open, persistence can only be enabled in one tab'
              : 'The current browser does not support all features required for persistence';
            
            logError(err, {
              source: 'Firebase Configuration',
              context: 'Enabling offline persistence'
            });
            
            console.warn(errorMessage);
          });
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      logError(error as Error, {
        source: 'Firebase Configuration',
        context: 'Initialization'
      });
      throw error;
    }
  }
  
  // Get singleton instance
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }
  
  // Getters for Firebase services
  public get auth(): Auth {
    return this._auth;
  }
  
  public get db(): Firestore {
    return this._db;
  }
  
  public get storage(): FirebaseStorage {
    return this._storage;
  }
  
  public get analytics(): Analytics | null {
    return this._analytics;
  }
}

// Create a single instance
const firebaseService = FirebaseService.getInstance();

// Export the services
export const auth = firebaseService.auth;
export const db = firebaseService.db;
export const storage = firebaseService.storage;
export const analytics = firebaseService.analytics;
export const firestore = db; // For backward compatibility

// Also export the service for special cases
export default firebaseService;
