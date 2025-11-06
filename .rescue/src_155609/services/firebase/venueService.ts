import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  writeBatch, 
  serverTimestamp, 
  increment, 
  arrayUnion, 
  arrayRemove, 
  query, 
  where, 
  DocumentData 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '@/firebase/config';
import { VenueService, Venue, UserProfile } from '@/types/services';
import { calculateDistance } from '@/utils/locationUtils';
import { saveToStorage, getFromStorage } from '@/utils/localStorageUtils';
import { isOnline } from '@/utils/networkMonitor';
import config from '@/config';
import logger from '@/utils/Logger';

// Cache key constants
const CACHE_KEYS = {
  VENUES: 'cached_venues',
  VENUE_PREFIX: 'venue_'
};

// Mock venue data for demo mode
const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'The Local Bar',
    type: 'bar',
    address: '123 Main Street',
    city: 'Melbourne',
    latitude: -37.8136,
    longitude: 144.9631,
    image: '/images/mock-a.jpg',
    checkInCount: 42,
    expiryTime: 120,
    zones: ['front', 'back', 'outdoor'],
    checkedInUsers: [],
    specials: [
      { title: 'Happy Hour', description: '5-7pm' },
      { title: 'Live Music', description: 'Fridays' }
    ],
  },
  {
    id: '2',
    name: 'Club Nightlife',
    type: 'club',
    address: '456 Party Avenue',
    city: 'Melbourne',
    latitude: -37.8136,
    longitude: 144.9631,
    image: '/images/mock-b.jpg',
    checkInCount: 88,
    expiryTime: 120,
    zones: ['main-floor', 'vip', 'rooftop'],
    checkedInUsers: [],
    specials: [
      { title: 'Student Night', description: 'Thursdays' },
      { title: 'VIP Packages', description: 'Available' }
    ],
  },
  {
    id: '3',
    name: 'Coffee Corner',
    type: 'cafe',
    address: '789 Coffee Lane',
    city: 'Melbourne',
    latitude: -37.8136,
    longitude: 144.9631,
    image: '/images/mock-c.jpg',
    checkInCount: 15,
    expiryTime: 120,
    zones: ['indoor', 'outdoor'],
    checkedInUsers: [],
    specials: [
      { title: 'Morning Special', description: 'Before 10am' },
      { title: 'Lunch Deal', description: '12-2pm' }
    ],
  }
];

const transformFirestoreVenue = (firestoreData: DocumentData, venueId: string): Venue => {
  return {
    id: venueId,
    name: firestoreData.name || 'Unknown Venue',
    type: firestoreData.type || 'venue',
    address: firestoreData.address || '',
    city: firestoreData.city || '',
    latitude: firestoreData.latitude || 0,
    longitude: firestoreData.longitude || 0,
    image: firestoreData.image || '',
    checkInCount: firestoreData.checkInCount || 0,
    expiryTime: firestoreData.expiryTime || 120,
    zones: firestoreData.zones || [],
    checkedInUsers: firestoreData.checkedInUsers || [],
    specials: firestoreData.specials || [],
  };
};

class FirebaseVenueService implements VenueService {
  private venuesCollection = collection(firestore, 'venues');

  async getVenues(): Promise<Venue[]> {
    // Return mock data in demo mode
    if (config.DEMO_MODE) {
      return [...mockVenues];
    }

    try {
      // Check network status first
      if (!isOnline()) {
        logger.debug('Offline: returning cached venues');
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
      logger.error('Error fetching venues', error);
      
      // Fallback to cached data if available
      const cachedVenues = getFromStorage<Venue[]>(CACHE_KEYS.VENUES, []);
      if (cachedVenues.length > 0) {
        return cachedVenues;
      }
      
      return [];
    }
  }

  async getVenueById(id: string): Promise<Venue | null> {
    // Return mock data in demo mode
    if (config.DEMO_MODE) {
      const mockVenue = mockVenues.find(venue => venue.id === id);
      return mockVenue || null;
    }

    try {
      // Check network status first
      if (!isOnline()) {
        logger.debug('Offline: checking for cached venue', { venueId: id });
        const cachedVenue = getFromStorage<Venue | null>(`${CACHE_KEYS.VENUE_PREFIX}${id}`, null);
        if (cachedVenue) {
          return cachedVenue;
        }
      }
      
      const venueDocRef = doc(firestore, 'venues', id);
      const venueDoc = await getDoc(venueDocRef);
      
      if (!venueDoc.exists()) {
        logger.debug('No venue found', { venueId: id });
        return null;
      }
      
      const venue = transformFirestoreVenue(venueDoc.data(), id);
      
      // Cache venue for offline access
      saveToStorage(`${CACHE_KEYS.VENUE_PREFIX}${id}`, venue);
      
      return venue;
    } catch (error) {
      logger.error('Error fetching venue by ID', error, { venueId: id });
      
      // Fallback to cached data
      const cachedVenue = getFromStorage<Venue | null>(`${CACHE_KEYS.VENUE_PREFIX}${id}`, null);
      return cachedVenue;
    }
  }

  async checkInToVenue(userId: string, venueId: string): Promise<void> {
    try {
      // First check out from any existing venue
      await this.checkOutFromVenue(userId);
      
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
      logger.info('User checked in to venue', { userId, venueId });
    } catch (error) {
      logger.error('Error checking in to venue', error, { userId, venueId });
      throw error;
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
      logger.info(`User ${userId} checked out from venue ${currentVenue}`);
    } catch (error) {
      logger.error('Error checking out from venue', error);
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
      logger.error('Error fetching nearby venues', error);
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
      logger.error('Error fetching venues by IDs', error);
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

  /**
   * Get all users checked into a specific venue
   */
  async getUsersAtVenue(venueId: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('currentVenue', '==', venueId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      logger.error('Error fetching users at venue', error);
      return [];
    }
  }
}

// Simple standalone check-in function
export const checkInToVenue = async (venueId: string): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated.');

  const userRef = doc(firestore, 'users', user.uid);
  const venueRef = doc(firestore, 'venues', venueId);

  // Confirm venue exists
  const venueSnap = await getDoc(venueRef);
  if (!venueSnap.exists()) throw new Error('Venue does not exist.');

  // Update user's checkedInVenues field
  await updateDoc(userRef, {
    checkedInVenues: arrayUnion(venueId),
    lastCheckIn: Date.now(),
  });
};

export const getCheckedInUsers = async (venueId: string): Promise<UserProfile[]> => {
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('checkedInVenues', 'array-contains', venueId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
};

export default new FirebaseVenueService();
