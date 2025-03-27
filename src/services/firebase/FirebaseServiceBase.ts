
import { collection, CollectionReference } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { isOnline } from '@/utils/networkMonitor';

export class FirebaseServiceBase {
  protected getCollection(collectionName: string): CollectionReference {
    try {
      if (!firestore) {
        throw new Error('Firestore not initialized');
      }
      return collection(firestore, collectionName);
    } catch (error) {
      console.error(`Error getting ${collectionName} collection:`, error);
      throw error;
    }
  }
  
  protected isFirebaseAvailable(): boolean {
    return !!firestore && isOnline();
  }
  
  protected handleError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
}
