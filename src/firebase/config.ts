
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, Firestore, CollectionReference } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Safe Firebase wrapper
class SafeFirebase {
  private _app: FirebaseApp | null = null;
  private _db: Firestore | null = null;
  private _auth: Auth | null = null;
  private _storage: FirebaseStorage | null = null;
  private _analytics: Analytics | null = null;
  private _initialized = false;
  
  constructor() {
    try {
      // Config from environment
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      };

      // Only initialize if we have a valid config
      if (this.isValidConfig(firebaseConfig)) {
        // Initialize Firebase (only once)
        this._app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        
        // Initialize services
        this._db = getFirestore(this._app);
        this._auth = getAuth(this._app);
        this._storage = getStorage(this._app);
        
        // Initialize analytics only in browser environment
        if (typeof window !== 'undefined') {
          try {
            this._analytics = getAnalytics(this._app);
          } catch (e) {
            console.warn('Analytics initialization failed:', e);
          }
        }
        
        this._initialized = true;
        console.log("Firebase initialized successfully");
      } else {
        console.warn("Invalid Firebase config, using mock services");
      }
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  }

  // Check if config has valid values
  private isValidConfig(config: any): boolean {
    return !!(
      config.apiKey && 
      config.projectId && 
      config.authDomain && 
      config.storageBucket
    );
  }

  // Safe getters that never throw errors
  get app(): FirebaseApp | null {
    return this._app;
  }
  
  get db(): Firestore | null {
    return this._db;
  }
  
  get auth(): Auth | null {
    return this._auth;
  }
  
  get storage(): FirebaseStorage | null {
    return this._storage;
  }
  
  get analytics(): Analytics | null {
    return this._analytics;
  }
  
  get initialized(): boolean {
    return this._initialized;
  }
  
  // Safe collection access
  getCollection(collectionName: string): CollectionReference | null {
    try {
      if (!this._initialized || !this._db) {
        return null;
      }
      return collection(this._db, collectionName);
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const firebase = new SafeFirebase();

// Export references to services
export const app = firebase.app;
export const db = firebase.db;
export const auth = firebase.auth;
export const storage = firebase.storage;
export const analytics = firebase.analytics;

// For backward compatibility
export const firestore = firebase.db;

// Export helper function for service initialization
export const isFirebaseAvailable = () => firebase.initialized;
export const getFirestoreCollection = (name: string) => firebase.getCollection(name);

// Export mock status for service determination
export const isMock = !firebase.initialized;
