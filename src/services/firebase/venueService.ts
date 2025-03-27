
import { firestore } from '@/firebase/config';
import { VenueService, Venue } from '@/types/services';
import { doc, getDoc, getDocs, collection, query, where, updateDoc, arrayUnion, arrayRemove, writeBatch, serverTimestamp, DocumentData, QueryDocumentSnapshot, increment } from 'firebase/firestore';
import { calculateDistance } from '@/utils/locationUtils';
import { saveToStorage, getFromStorage } from '@/utils/localStorageUtils';
import { isOnline } from '@/utils/networkMonitor';

// Cache key constants
const CACHE_KEYS = {
  VENUES: 'cached_venues',
  VENUE_PREFIX: 'venue_'
};

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
    specials: firestoreData?.specials || [],
  };
};

class FirebaseVenueService implements VenueService {
  async getVenues(): Promise<Venue[]> {
    try {
      // Check network status first
      if (!isOnline()) {
        console.log('Offline: returning cached venues');
        const cachedVenues = getFromStorage<Venue[]>(CACHE_KEYS.VENUES, []);
        if (cachedVenues.length > 0) {
          return cachedVenues;
        }
      }

      const venuesCollectionRef = collection(firestore, 'venues');
      const querySnapshot = await getDocs(venuesCollectionRef);
      
      const venues = querySnapshot.docs.map(doc => 
        transformFirestoreVenue(doc.data(), doc.id)
      );
      
      // Cache venues for offline access
      saveToStorage(CACHE_KEYS.VENUES, venues);
      
      return venues;
    } catch (error) {
      console.error('Error fetching venues:', error);
      
      // Fallback to cached data if available
      const cachedVenues = getFromStorage<Venue[]>(CACHE_KEYS.VENUES, []);
      if (cachedVenues.length > 0) {
        return cachedVenues;
      }
      
      return [];
    }
  }

  async getVenueById(id: string): Promise<Venue | null> {
    try {
      // Check network status first
      if (!isOnline()) {
        console.log('Offline: checking for cached venue');
        const cachedVenue = getFromStorage<Venue | null>(`${CACHE_KEYS.VENUE_PREFIX}${id}`, null);
        if (cachedVenue) {
          return cachedVenue;
        }
      }
      
      const venueDocRef = doc(firestore, 'venues', id);
      const venueDoc = await getDoc(venueDocRef);
      
      if (!venueDoc.exists()) {
        console.log(`No venue found with id: ${id}`);
        return null;
      }
      
      const venue = transformFirestoreVenue(venueDoc.data(), id);
      
      // Cache venue for offline access
      saveToStorage(`${CACHE_KEYS.VENUE_PREFIX}${id}`, venue);
      
      return venue;
    } catch (error) {
      console.error('Error fetching venue by ID:', error);
      
      // Fallback to cached data
      const cachedVenue = getFromStorage<Venue | null>(`${CACHE_KEYS.VENUE_PREFIX}${id}`, null);
      return cachedVenue;
    }
  }

  async checkInToVenue(userId: string, venueId: string): Promise<void> {
    try {
      const batch = writeBatch(firestore);
      
      // Update user's check-in status
      const userDocRef = doc(firestore, 'users', userId);
      batch.update(userDocRef, {
        isCheckedIn: true,
        currentVenue: venueId,
        checkInTime: serverTimestamp()
      });
      
      // Increment venue's check-in count and add user to checkedInUsers array
      const venueDocRef = doc(firestore, 'venues', venueId);
      batch.update(venueDocRef, {
        checkInCount: increment(1),
        checkedInUsers: arrayUnion(userId)
      });
      
      await batch.commit();
      console.log(`User ${userId} checked in to venue ${venueId}`);
    } catch (error) {
      console.error('Error checking in to venue:', error);
      throw new Error('Failed to check in to venue');
    }
  }

  async checkOutFromVenue(userId: string): Promise<void> {
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
        return;
      }
      
      const batch = writeBatch(firestore);
      
      // Update user's check-out status
      batch.update(userDocRef, {
        isCheckedIn: false,
        currentVenue: null,
        currentZone: null,
        checkOutTime: serverTimestamp()
      });
      
      // Decrement venue's check-in count and remove user from checkedInUsers array
      const venueDocRef = doc(firestore, 'venues', currentVenue);
      batch.update(venueDocRef, {
        checkInCount: increment(-1),
        checkedInUsers: arrayRemove(userId)
      });
      
      await batch.commit();
      console.log(`User ${userId} checked out from venue ${currentVenue}`);
    } catch (error) {
      console.error('Error checking out from venue:', error);
      throw new Error('Failed to check out from venue');
    }
  }

  // Additional method to get nearby venues based on coordinates
  async getNearbyVenues(latitude: number, longitude: number, radiusKm: number = 5): Promise<Venue[]> {
    try {
      // Check network status first
      if (!isOnline()) {
        const cachedVenues = getFromStorage<Venue[]>(CACHE_KEYS.VENUES, []);
        if (cachedVenues.length > 0) {
          // Filter cached venues by distance
          return cachedVenues.filter(venue => {
            const distance = calculateDistance(
              { latitude, longitude },
              { latitude: venue.latitude, longitude: venue.longitude }
            );
            return distance <= radiusKm;
          });
        }
      }
      
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

  // Helper method to get venues by array of IDs
  async getVenuesByIds(venueIds: string[]): Promise<Venue[]> {
    try {
      if (!venueIds.length) return [];
      
      // Check network status first
      if (!isOnline()) {
        const cachedVenues = getFromStorage<Venue[]>(CACHE_KEYS.VENUES, []);
        if (cachedVenues.length > 0) {
          return cachedVenues.filter(venue => venueIds.includes(venue.id));
        }
      }
      
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

  // Helper function to chunk arrays
  private chunk<T>(array: T[], size: number): T[][] {
    const chunked: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  }
  
  // Add the required method for e2eTests compatibility
  async getAllVenues(): Promise<Venue[]> {
    return this.getVenues();
  }
}

export default new FirebaseVenueService();
