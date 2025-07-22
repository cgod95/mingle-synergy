import { CollectionReference, collection } from 'firebase/firestore';
import { getDB, isFirebaseAvailable } from '@/firebase/safeFirebase';
import { isOnline } from '@/utils/networkMonitor';
import logger from '@/utils/Logger';

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
      logger.error(`Error getting ${collectionName} collection:`, error);
      return null;
    }
  }
  
  protected isFirebaseAvailable(): boolean {
    return isFirebaseAvailable() && isOnline();
  }
  
  protected handleError(error: unknown, operation: string): never {
    logger.error(`Error in ${operation}:`, error);
    throw error;
  }
}
