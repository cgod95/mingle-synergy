import { db } from '@/firebase';
import { collection, doc, getDocs, getDoc, updateDoc, writeBatch, arrayUnion, arrayRemove, serverTimestamp, increment, setDoc, runTransaction } from 'firebase/firestore';
import { Venue, VenueUser } from '@/types/services';
import logger from '@/utils/Logger';

// Venue service for managing venue operations
class VenueService {
  private readonly venuesCollection = 'venues';
  private readonly usersCollection = 'users';

  /**
   * Get all venues
   */
  async getVenues(): Promise<Venue[]> {
    try {
      const venuesRef = collection(db, this.venuesCollection);
      const snapshot = await getDocs(venuesRef);
      
      const venues: Venue[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        venues.push({
          id: doc.id,
          name: data.name,
          city: data.city,
          address: data.address,
          image: data.image,
          checkInCount: data.checkInCount || 0,
          checkedInUsers: data.checkedInUsers || [],
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          type: data.type || 'venue',
          expiryTime: data.expiryTime || Date.now() + 3600 * 1000,
          zones: data.zones || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      // If no venues exist, create some test venues
      if (venues.length === 0) {
        await this.createTestVenues();
        return this.getVenues(); // Recursive call to get the newly created venues
      }
      
      return venues;
    } catch (error) {
      logger.error('Error fetching venues:', error);
      throw new Error('Failed to fetch venues');
    }
  }

  /**
   * Create test venues for development
   */
  private async createTestVenues(): Promise<void> {
    try {
      const testVenues = [
        {
          id: 'test-cafe-1',
          name: 'Downtown Coffee Co.',
          city: 'San Francisco',
          address: '123 Market St',
          image: '',
          checkInCount: 0,
          checkedInUsers: [],
          latitude: 37.7749,
          longitude: -122.4194,
          type: 'cafe',
          expiryTime: Date.now() + 3600 * 1000,
          zones: ['downtown'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-bar-1',
          name: 'The Social Bar',
          city: 'San Francisco',
          address: '456 Mission St',
          image: '',
          checkInCount: 0,
          checkedInUsers: [],
          latitude: 37.7849,
          longitude: -122.4094,
          type: 'bar',
          expiryTime: Date.now() + 3600 * 1000,
          zones: ['mission'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-restaurant-1',
          name: 'Urban Kitchen',
          city: 'San Francisco',
          address: '789 Valencia St',
          image: '',
          checkInCount: 0,
          checkedInUsers: [],
          latitude: 37.7649,
          longitude: -122.4294,
          type: 'restaurant',
          expiryTime: Date.now() + 3600 * 1000,
          zones: ['valencia'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const batch = writeBatch(db);
      
      for (const venue of testVenues) {
        const venueRef = doc(db, this.venuesCollection, venue.id);
        batch.set(venueRef, venue);
      }
      
      await batch.commit();
      logger.info('Created test venues');
    } catch (error) {
      logger.error('Error creating test venues:', error);
    }
  }

  /**
   * Get a specific venue by ID
   */
  async getVenueById(id: string): Promise<Venue | null> {
    try {
      const venueRef = doc(db, this.venuesCollection, id);
      const venueDoc = await getDoc(venueRef);
      
      if (!venueDoc.exists()) {
        return null;
      }
      
      const data = venueDoc.data();
      return {
        id: venueDoc.id,
        name: data.name,
        city: data.city,
        address: data.address,
        image: data.image,
        checkInCount: data.checkInCount || 0,
        checkedInUsers: data.checkedInUsers || [],
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        type: data.type || 'venue',
        expiryTime: data.expiryTime || Date.now() + 3600 * 1000,
        zones: data.zones || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      logger.error('Error fetching venue:', error);
      throw new Error('Failed to fetch venue');
    }
  }

  /**
   * Check in a user to a venue
   */
  async checkInToVenue(userId: string, venueId: string): Promise<void> {
    try {
      const venueRef = doc(db, this.venuesCollection, venueId);
      const userRef = doc(db, this.usersCollection, userId);

      await runTransaction(db, async (txn) => {
        const venueSnap = await txn.get(venueRef);
        if (!venueSnap.exists()) throw new Error('Venue not found');

        txn.update(venueRef, {
          checkInCount: increment(1),
          checkedInUsers: arrayUnion(userId),
          updatedAt: serverTimestamp(),
        });

        txn.update(userRef, {
          isCheckedIn: true,
          currentVenue: venueId,
          checkedInVenueId: venueId,
          checkInTime: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      logger.info(`[CHECK-IN] success`, { userId, venueId });
    } catch (error) {
      logger.error('[CHECK-IN] failed:', error);
      throw error;
    }
  }

  /**
   * Alias to maintain API consistency: checkIn(userId, venueId)
   */
  async checkIn(userId: string, venueId: string): Promise<void> {
    return this.checkInToVenue(userId, venueId);
  }

  /**
   * Check out a user from a venue
   */
  async checkOutFromVenue(userId: string, venueId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Update venue document
      const venueRef = doc(db, this.venuesCollection, venueId);
      batch.update(venueRef, {
        checkInCount: increment(-1),
        checkedInUsers: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      
      // Update user document
      const userRef = doc(db, this.usersCollection, userId);
      batch.update(userRef, {
        isCheckedIn: false,
        currentVenue: null,
        checkedInVenueId: null,
        checkInTime: null,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      logger.info(`User ${userId} checked out from venue ${venueId}`);
    } catch (error) {
      logger.error('Error checking out from venue:', error);
      throw new Error('Failed to check out from venue');
    }
  }

  /**
   * Get users currently checked in to a venue
   */
  async getUsersAtVenue(venueId: string): Promise<VenueUser[]> {
    try {
      const venue = await this.getVenueById(venueId);
      if (!venue) {
        throw new Error('Venue not found');
      }
      
      const users: VenueUser[] = [];
      for (const userId of venue.checkedInUsers) {
        const userRef = doc(db, this.usersCollection, userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          users.push({
            id: userDoc.id,
            name: userData.name,
            photos: userData.photos || [],
            bio: userData.bio,
            age: userData.age,
            interests: userData.interests || [],
            checkInTime: userData.checkInTime?.toDate() || new Date()
          });
        }
      }
      
      return users;
    } catch (error) {
      logger.error('Error fetching users at venue:', error);
      throw new Error('Failed to fetch users at venue');
    }
  }
}

export default new VenueService();
