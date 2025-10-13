import { CollectionReference, collection } from 'firebase/firestore';
import { db } from '@/firebase';
import { isOnline } from '@/utils/networkMonitor';
import logger from '@/utils/Logger';

export class FirebaseServiceBase {
  protected getCollection(collectionName: string): CollectionReference | null {
    try {
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
    return db !== null && isOnline();
  }
  
  protected handleError(error: unknown, operation: string): never {
    logger.error(`Error in ${operation}:`, error);
    throw error;
  }
}
