import { firestore } from '../firebase';
import { VenueService, Venue } from '@/types/services';
import { doc, getDoc, getDocs, collection, query, where, updateDoc, arrayUnion, arrayRemove, writeBatch, serverTimestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { calculateDistance } from '@/utils/locationUtils';

// Helper function to transform Firestore data
const transformFirestoreVenue = (firestoreData: DocumentData, venueId: string): Venue => {
  return {
    id: venueId,
    name: firestoreData?.name || '',
    type: firestoreData?.type || 'other',
    address: firestoreData?.address || '',
    city: firestoreData?.city || '',
    image: firestoreData?.image || '',
    checkInCount: firestoreData?.checkInCount || 0,
    expiryTime: firestoreData?.expiryTime || 120, // Default 2 hours in minutes
    zones: firestoreData?.zones || [],
    latitude: firestoreData?.latitude || 0,
    longitude: firestoreData?.longitude || 0,
    checkedInUsers: firestoreData?.checkedInUsers || [],
  };
};

class FirebaseVenueService implements VenueService {
  async getVenues(): Promise<Venue[]> {
    try {
      const venuesCollectionRef = collection(firestore, 'venues');
      const querySnapshot = await getDocs(venuesCollectionRef);
      
      return querySnapshot.docs.map(doc => 
        transformFirestoreVenue(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error fetching venues:', error);
      return [];
    }
  }

  async getVenueById(id: string): Promise<Venue | null> {
    try {
      const venueDocRef = doc(firestore, 'venues', id);
      const venueDoc = await getDoc(venueDocRef);
      
      if (!venueDoc.exists()) {
        console.log(`No venue found with id: ${id}`);
        return null;
      }
      
      return transformFirestoreVenue(venueDoc.data(), id);
    } catch (error) {
      console.error('Error fetching venue by ID:', error);
      return null;
    }
  }

  async checkInToVenue(userId: string, venueId: string): Promise<boolean> {
    try {
      const batch = writeBatch(firestore);
      
      // Update user's check-in status
      const userDocRef = doc(firestore, 'users', userId);
      batch.update(userDocRef, {
        isCheckedIn: true,
        currentVenue: venueId,
        checkInTime: serverTimestamp()
      });
      
      // Increment venue's check-in count
      const venueDocRef = doc(firestore, 'venues', venueId);
      batch.update(venueDocRef, {
        checkInCount: arrayUnion(userId)
      });
      
      await batch.commit();
      console.log(`User ${userId} checked in to venue ${venueId}`);
      return true;
    } catch (error) {
      console.error('Error checking in to venue:', error);
      return false;
    }
  }

  async checkOutFromVenue(userId: string): Promise<boolean> {
    try {
      // First get the user to find their current venue
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const currentVenue = userData.currentVenue;
      
      if (!currentVenue) {
        // User isn't checked in, nothing to do
        return true;
      }
      
      const batch = writeBatch(firestore);
      
      // Update user's check-out status
      batch.update(userDocRef, {
        isCheckedIn: false,
        currentVenue: null,
        currentZone: null,
        checkOutTime: serverTimestamp()
      });
      
      // Decrement venue's check-in count
      const venueDocRef = doc(firestore, 'venues', currentVenue);
      batch.update(venueDocRef, {
        checkInCount: arrayRemove(userId)
      });
      
      await batch.commit();
      console.log(`User ${userId} checked out from venue ${currentVenue}`);
      return true;
    } catch (error) {
      console.error('Error checking out from venue:', error);
      return false;
    }
  }

  async getNearbyVenues(latitude: number, longitude: number, radiusKm: number = 5): Promise<Venue[]> {
    try {
      // In a production app, we'd use geofirestore or similar
      // For this implementation, we'll fetch all venues and filter client-side
      const venues = await this.getVenues();
      
      return venues.filter(venue => {
        const distance = calculateDistance(
          { latitude, longitude },
          { latitude: venue.latitude, longitude: venue.longitude }
        );
        
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Error fetching nearby venues:', error);
      return [];
    }
  }

  async getVenuesByIds(venueIds: string[]): Promise<Venue[]> {
    try {
      if (!venueIds.length) return [];
      
      // Firestore limits "in" queries to 10 items, so we need to chunk
      const chunkedResults = await Promise.all(
        // Split into chunks of 10
        this.chunk(venueIds, 10).map(async (chunk) => {
          const venuesRef = collection(firestore, 'venues');
          const q = query(venuesRef, where('__name__', 'in', chunk));
          const snapshot = await getDocs(q);
            
          return snapshot.docs.map(doc => 
            transformFirestoreVenue(doc.data(), doc.id)
          );
        })
      );
      
      // Flatten results
      return chunkedResults.flat();
    } catch (error) {
      console.error('Error fetching venues by IDs:', error);
      return [];
    }
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunked: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  }
}

export default new FirebaseVenueService();
