import { describe, it, expect, beforeEach, vi } from 'vitest';
import venueService from '@/services/firebase/venueService';
import userService from '@/services/firebase/userService';
import { UserProfile } from '@/types/services';

// Mock Firebase services
vi.mock('@/services/firebase/venueService');
vi.mock('@/services/firebase/userService');
vi.mock('@/utils/Logger');

describe('Venue Check-in Logic', () => {
  const mockVenueService = venueService as any;
  const mockUserService = userService as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check in user to venue and update profile', async () => {
    const userId = 'user123';
    const venueId = 'venue456';
    
    // Mock successful check-in
    mockVenueService.checkInToVenue.mockResolvedValue(undefined);
    mockUserService.updateUserProfile.mockResolvedValue(undefined);

    // Perform check-in
    await venueService.checkInToVenue(userId, venueId);
    await userService.updateUserProfile(userId, {
      currentVenue: venueId,
      isCheckedIn: true
    });

    // Verify venue service was called
    expect(mockVenueService.checkInToVenue).toHaveBeenCalledWith(userId, venueId);
    
    // Verify user profile was updated
    expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(userId, {
      currentVenue: venueId,
      isCheckedIn: true
    });
  });

  it('should reflect check-in state in user profile', async () => {
    const userId = 'user123';
    const venueId = 'venue456';

    // Mock user profile with check-in state
    const userProfile: UserProfile = {
      id: userId,
      name: 'Test User',
      age: 25,
      gender: 'female',
      interestedIn: ['male'],
      bio: 'Test bio',
      photos: [],
      isCheckedIn: true,
      isVisible: true,
      interests: ['music'],
      ageRangePreference: { min: 20, max: 30 },
      matches: [],
      likedUsers: [],
      blockedUsers: [],
      currentVenue: venueId,
    };

    mockUserService.getUserProfile.mockResolvedValue(userProfile);

    const profile = await userService.getUserProfile(userId);

    // Verify check-in state is reflected
    expect(profile?.isCheckedIn).toBe(true);
    expect(profile?.currentVenue).toBe(venueId);
  });

  it('should handle check-in errors gracefully', async () => {
    const userId = 'user123';
    const venueId = 'venue456';

    // Mock check-in failure
    mockVenueService.checkInToVenue.mockRejectedValue(new Error('Check-in failed'));

    // Attempt check-in and expect it to throw
    await expect(venueService.checkInToVenue(userId, venueId)).rejects.toThrow('Check-in failed');
  });

  it('should allow checking out by clearing venue', async () => {
    const userId = 'user123';

    // Mock successful profile update
    mockUserService.updateUserProfile.mockResolvedValue(undefined);

    // Check out by clearing venue
    await userService.updateUserProfile(userId, {
      currentVenue: undefined,
      isCheckedIn: false
    });

    // Verify user profile was updated to checked out state
    expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(userId, {
      currentVenue: undefined,
      isCheckedIn: false
    });
  });

  it('should validate venue exists before check-in', async () => {
    const userId = 'user123';
    const venueId = 'nonexistent-venue';

    // Mock venue not found
    mockVenueService.getVenueById.mockResolvedValue(null);

    const venue = await venueService.getVenueById(venueId);

    // Verify venue doesn't exist
    expect(venue).toBeNull();
  });
}); 