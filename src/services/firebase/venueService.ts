import { firestore } from '@/firebase/config';
import { VenueService, Venue, UserProfile } from '@/types/services';
import { doc, getDoc, getDocs, collection, query, where, updateDoc, arrayUnion, arrayRemove, writeBatch, serverTimestamp, DocumentData, QueryDocumentSnapshot, increment } from 'firebase/firestore';
import { calculateDistance } from '@/utils/locationUtils';
import { saveToStorage, getFromStorage } from '@/utils/localStorageUtils';
import { isOnline } from '@/utils/networkMonitor';
import { getAuth } from 'firebase/auth';
import config from '@/config';

// Cache key constants
const CACHE_KEYS = {
  VENUES: 'cached_venues',
  VENUE_PREFIX: 'venue_'
};

// Mock venue data for demo mode - expanded with Unsplash images
// Sydney venues with Sydney coordinates
const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Neon Garden',
    type: 'bar',
    address: '123 George Street',
    city: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
    checkInCount: 42,
    expiryTime: 120,
    zones: ['front', 'back', 'outdoor', 'rooftop'],
    checkedInUsers: [],
    specials: [
      { title: 'Happy Hour', description: '5-7pm' },
      { title: 'Live Music', description: 'Fridays' }
    ],
  },
  {
    id: '2',
    name: 'Club Aurora',
    type: 'club',
    address: '456 Oxford Street',
    city: 'Sydney',
    latitude: -33.8788,
    longitude: 151.2093,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
    checkInCount: 88,
    expiryTime: 120,
    zones: ['main-floor', 'vip', 'rooftop', 'dance-floor'],
    checkedInUsers: [],
    specials: [
      { title: 'Student Night', description: 'Thursdays' },
      { title: 'VIP Packages', description: 'Available' }
    ],
  },
  {
    id: '3',
    name: 'The Roastery',
    type: 'cafe',
    address: '789 King Street',
    city: 'Sydney',
    latitude: -33.8588,
    longitude: 151.1993,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4c7c6e?w=800&h=600&fit=crop',
    checkInCount: 15,
    expiryTime: 120,
    zones: ['indoor', 'outdoor', 'patio'],
    checkedInUsers: [],
    specials: [
      { title: 'Free WiFi', description: 'Available' },
      { title: 'Artisan Coffee', description: 'Premium beans' }
    ],
  },
  {
    id: '4',
    name: 'Sunset Lounge',
    type: 'bar',
    address: '321 Darling Harbour',
    city: 'Sydney',
    latitude: -33.8688,
    longitude: 151.1993,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    checkInCount: 28,
    expiryTime: 120,
    zones: ['lounge', 'bar', 'outdoor'],
    checkedInUsers: [],
    specials: [
      { title: 'Cocktail Hour', description: '6-8pm' },
      { title: 'Rooftop Views', description: 'Sunset specials' }
    ],
  },
  {
    id: '5',
    name: 'The Warehouse',
    type: 'club',
    address: '555 Surry Hills',
    city: 'Sydney',
    latitude: -33.8888,
    longitude: 151.2093,
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=600&fit=crop',
    checkInCount: 65,
    expiryTime: 120,
    zones: ['main-floor', 'mezzanine', 'vip'],
    checkedInUsers: [],
    specials: [
      { title: 'Techno Night', description: 'Saturdays' },
      { title: 'Late Night', description: 'Until 4am' }
    ],
  },
  {
    id: '6',
    name: 'Garden Bistro',
    type: 'restaurant',
    address: '888 Paddington',
    city: 'Sydney',
    latitude: -33.8788,
    longitude: 151.2193,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    checkInCount: 34,
    expiryTime: 120,
    zones: ['dining', 'bar', 'garden'],
    checkedInUsers: [],
    specials: [
      { title: 'Farm to Table', description: 'Fresh ingredients' },
      { title: 'Wine Pairing', description: 'Available' }
    ],
  },
  {
    id: '7',
    name: 'The Loft',
    type: 'bar',
    address: '777 Newtown',
    city: 'Sydney',
    latitude: -33.8988,
    longitude: 151.1793,
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop',
    checkInCount: 52,
    expiryTime: 120,
    zones: ['main', 'loft', 'outdoor'],
    checkedInUsers: [],
    specials: [
      { title: 'Craft Cocktails', description: 'Signature drinks' },
      { title: 'Live Jazz', description: 'Wednesdays' }
    ],
  },
  {
    id: '8',
    name: 'Electric Dreams',
    type: 'club',
    address: '999 Circular Quay',
    city: 'Sydney',
    latitude: -33.8588,
    longitude: 151.2093,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
    checkInCount: 95,
    expiryTime: 120,
    zones: ['main-floor', 'vip', 'chill-zone'],
    checkedInUsers: [],
    specials: [
      { title: 'EDM Night', description: 'Fridays' },
      { title: 'Light Show', description: 'Every hour' }
    ],
  },
];

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
  private venuesCollection = collection(firestore, 'venues');
  
  async getVenues(): Promise<Venue[]> {
    // Return mock data in demo mode
    if (config.DEMO_MODE) {
      return mockVenues;
    }

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
    // Return mock data in demo mode
    if (config.DEMO_MODE) {
      const mockVenue = mockVenues.find(venue => venue.id === id);
      return mockVenue || null;
    }

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
      console.error('Error fetching users at venue:', error);
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
