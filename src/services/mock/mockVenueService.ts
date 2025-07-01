import { VenueService, Venue, UserProfile } from '@/types/services';
import { venues } from '@/data/mockData';
import { calculateDistance } from '@/utils/locationUtils';
import { users } from '@/data/mockData';

class MockVenueService implements VenueService {
  // Mock implementations to provide data for testing and development
  async getVenues(): Promise<Venue[]> {
    return venues.map(venue => this.transformToServiceVenue(venue));
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
      .map(user => ({
        id: user.id,
        name: user.name,
        age: user.age,
        bio: user.bio,
        photos: user.photos,
        isCheckedIn: user.isCheckedIn,
        isVisible: user.isVisible,
        interests: user.interests,
        gender: user.gender,
        interestedIn: user.interestedIn,
        ageRangePreference: user.ageRangePreference,
        matches: user.matches || [],
        likedUsers: user.likedUsers || [],
        blockedUsers: user.blockedUsers || []
      }));
  }

  // Helper to transform mock venue data to match services Venue type
  private transformToServiceVenue(venue: Venue): Venue {
    return {
      id: venue.id,
      name: venue.name,
      address: venue.address || '',
      city: venue.city || 'Unknown City',
      latitude: venue.latitude || 0,
      longitude: venue.longitude || 0,
      type: venue.type || 'other',
      checkInCount: venue.checkInCount || 0,
      expiryTime: venue.expiryTime || 120,
      zones: venue.zones || [],
      image: venue.image || '',
      checkedInUsers: venue.checkedInUsers || [],
      specials: venue.specials || []
    };
  }
}

export default new MockVenueService();
