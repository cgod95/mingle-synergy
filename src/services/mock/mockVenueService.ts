
import { VenueService } from '@/types/services';
import { Venue } from '@/types';
import { venues, users } from '@/data/mockData';

class MockVenueService implements VenueService {
  async getVenues(): Promise<Venue[]> {
    // Return all venues from our mock data
    return [...venues];
  }

  async getVenueById(id: string): Promise<Venue | null> {
    // Find the venue by ID
    const venue = venues.find(v => v.id === id);
    return venue || null;
  }

  async checkInToVenue(userId: string, venueId: string): Promise<void> {
    const userIndex = users.findIndex(u => u.id === userId);
    const venue = venues.find(v => v.id === venueId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    if (!venue) {
      throw new Error('Venue not found');
    }
    
    // Update the user's check-in status
    users[userIndex] = {
      ...users[userIndex],
      isCheckedIn: true,
      currentVenue: venueId,
      isVisible: true, // Automatically make user visible when checking in
    };
    
    // Increment the venue's check-in count
    venue.checkInCount += 1;
    
    console.log(`[Mock] User ${userId} checked in to venue ${venueId}`);
  }

  async checkOutFromVenue(userId: string): Promise<void> {
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const previousVenue = users[userIndex].currentVenue;
    
    // Update the user's check-in status
    users[userIndex] = {
      ...users[userIndex],
      isCheckedIn: false,
      currentVenue: undefined,
      isVisible: false, // Automatically make user invisible when checking out
    };
    
    // Decrement the venue's check-in count if applicable
    if (previousVenue) {
      const venueIndex = venues.findIndex(v => v.id === previousVenue);
      if (venueIndex !== -1 && venues[venueIndex].checkInCount > 0) {
        venues[venueIndex].checkInCount -= 1;
      }
    }
    
    console.log(`[Mock] User ${userId} checked out from venue`);
  }
}

export default new MockVenueService();
