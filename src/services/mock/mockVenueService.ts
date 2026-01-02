import { VenueService, Venue, UserProfile } from '@/types/services';
import { venues } from '@/data/mockData';
import type { Venue as MockVenue } from '@/types';
import { calculateDistance } from '@/utils/locationUtils';
import { users } from '@/data/mockData';

class MockVenueService implements VenueService {
  // Mock implementations to provide data for testing and development
  async listVenues(): Promise<Venue[]> {
    return venues.map(venue => this.transformToServiceVenue(venue));
  }

  async getVenues(): Promise<Venue[]> {
    return this.listVenues();
  }

  async getVenueById(id: string): Promise<Venue | null> {
    const venue = venues.find(v => v.id === id);
    return venue ? this.transformToServiceVenue(venue) : null;
  }

  async checkInToVenue(userId: string, venueId: string): Promise<void> {
    console.log(`Mock: User ${userId} checked in to venue ${venueId}`);
    return Promise.resolve();
  }

  async checkOutFromVenue(userId: string): Promise<void> {
    console.log(`Mock: User ${userId} checked out`);
    return Promise.resolve();
  }

  async getNearbyVenues(latitude: number, longitude: number, radiusKm: number = 5): Promise<Venue[]> {
    return venues
      .map(venue => this.transformToServiceVenue(venue))
      .filter(venue => {
        const distance = calculateDistance(
          { latitude, longitude },
          { latitude: venue.latitude, longitude: venue.longitude }
        );
        return distance <= radiusKm;
      });
  }

  async getVenuesByIds(venueIds: string[]): Promise<Venue[]> {
    return venues
      .filter(venue => venueIds.includes(venue.id))
      .map(venue => this.transformToServiceVenue(venue));
  }

  // Implement the required method for e2eTests compatibility
  async getAllVenues(): Promise<Venue[]> {
    return this.getVenues();
  }

  /**
   * Get all users checked into a specific venue
   */
  async getUsersAtVenue(venueId: string): Promise<UserProfile[]> {
    console.log(`Mock: Fetching users at venue ${venueId}`);
    
    // Return mock users that are "checked in" to the venue
    // In a real implementation, this would query users where currentVenue === venueId
    return users
      .filter(user => user.isCheckedIn && user.currentVenue === venueId)
      .map(user => {
        const userProfile: UserProfile = {
          id: user.id,
          name: user.name || 'Demo User',
          displayName: user.name || 'Demo User',
          age: user.age || 25,
          bio: user.bio || '',
          photos: user.photos || [],
          isCheckedIn: user.isCheckedIn ?? false,
          isVisible: user.isVisible ?? true,
          interests: user.interests || [],
          gender: (user.gender === 'man' || user.gender === 'woman') ? user.gender : 'man',
          interestedIn: (['men', 'women', 'everyone'].includes(user.interestedIn as unknown as string)) ? user.interestedIn as unknown as 'men' | 'women' | 'everyone' : 'everyone',
          ageRangePreference: user.ageRangePreference || { min: 18, max: 40 },
          matches: user.matches || [],
          likedUsers: user.likedUsers || [],
          blockedUsers: user.blockedUsers || []
        };
        if (user.currentVenue) {
          userProfile.currentVenue = user.currentVenue;
        }
        if (user.currentZone) {
          userProfile.currentZone = user.currentZone;
        }
        return userProfile;
      });
  }

  // Helper to transform mock venue data to match services Venue type
  private transformToServiceVenue(venue: MockVenue): Venue {
    return {
      id: venue.id,
      name: venue.name,
      address: venue.address || '',
      city: venue.city || 'Unknown City',
      latitude: (venue as any).latitude || 0,
      longitude: (venue as any).longitude || 0,
      type: typeof venue.type === 'string' ? venue.type : 'other',
      checkInCount: venue.checkInCount || 0,
      expiryTime: venue.expiryTime || 120,
      zones: Array.isArray(venue.zones) ? venue.zones.map(z => typeof z === 'string' ? z : z.id) : [],
      image: venue.image || '',
      checkedInUsers: (venue as any).checkedInUsers || [],
      specials: venue.specials ? venue.specials.map(s => ({ title: s.title || '', description: s.description || '' })) : []
    };
  }
}

export default new MockVenueService();
