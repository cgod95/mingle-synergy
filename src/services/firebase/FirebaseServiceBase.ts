
import { CollectionReference } from 'firebase/firestore';
import { firebase, isFirebaseAvailable } from '@/firebase/config';
import { isOnline } from '@/utils/networkMonitor';

export class FirebaseServiceBase {
  protected getCollection(collectionName: string): CollectionReference {
    try {
      const collection = firebase.getCollection(collectionName);
      if (!collection) {
        throw new Error(`Firestore collection ${collectionName} not available`);
      }
      return collection;
    } catch (error) {
      console.error(`Error getting ${collectionName} collection:`, error);
      throw error;
    }
  }
  
  protected isFirebaseAvailable(): boolean {
    return isFirebaseAvailable() && isOnline();
  }
  
  protected handleError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
}
