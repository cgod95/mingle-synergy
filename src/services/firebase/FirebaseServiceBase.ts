import { CollectionReference, collection } from 'firebase/firestore';
import { getDB, isFirebaseAvailable } from '@/firebase/safeFirebase';
import { isOnline } from '@/utils/networkMonitor';
import logger from '@/utils/Logger';
import { logError } from '@/utils/errorHandler';

export class FirebaseServiceBase {
  protected getCollection(collectionName: string): CollectionReference | null {
    try {
      const db = getDB();
      if (!db) {
        logger.warn(`Firestore not available for collection ${collectionName}`);
        return null;
      }
      
      return collection(db, collectionName);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        source: 'FirebaseServiceBase',
        action: 'getCollection',
        collectionName
      });
      return null;
    }
  }
  
  protected isFirebaseAvailable(): boolean {
    return isFirebaseAvailable() && isOnline();
  }
  
  protected handleError(error: unknown, operation: string): never {
    logError(error instanceof Error ? error : new Error(String(error)), {
      source: 'FirebaseServiceBase',
      action: operation
    });
    throw error;
  }
}
