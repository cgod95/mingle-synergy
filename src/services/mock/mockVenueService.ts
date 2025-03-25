import { VenueService, Venue } from '@/types/services';
import { venues } from '@/data/mockData';
import { calculateDistance } from '@/utils/locationUtils';

class MockVenueService implements VenueService {
  // Mock implementations to provide data for testing and development
  async getVenues(): Promise<Venue[]> {
    return venues.map(venue => this.transformVenue(venue));
  }

  async getVenueById(id: string): Promise<Venue | null> {
    const venue = venues.find(v => v.id === id);
    if (!venue) return null;
    return this.transformVenue(venue);
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
      .map(venue => this.transformVenue(venue))
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
      .map(venue => this.transformVenue(venue));
  }

  // Add new method used in e2eTests
  async getAllVenues(): Promise<Venue[]> {
    return this.getVenues();
  }

  // Helper to transform mock data to match Venue type
  private transformVenue(venue: any): Venue {
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
      checkedInUsers: venue.checkedInUsers || []
    };
  }
}

export default new MockVenueService();
