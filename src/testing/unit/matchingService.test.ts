import { describe, it, expect, beforeEach, vi } from 'vitest';
import { matchingService } from '@/services/matchingService';
import userService from '@/services/firebase/userService';
import venueService from '@/services/firebase/venueService';
import { UserProfile } from '@/types/services';

// Mock Firebase services
vi.mock('@/services/firebase/userService');
vi.mock('@/services/firebase/venueService');
vi.mock('@/utils/Logger');

describe('MatchingService - getPotentialMatches', () => {
  const mockUserService = userService as any;
  const mockVenueService = venueService as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter users by gender preferences', async () => {
    // Mock current user profile
    const currentUserProfile: UserProfile = {
      id: 'user1',
      name: 'Alice',
      age: 25,
      gender: 'female',
      interestedIn: ['male'],
      bio: 'Test bio',
      photos: [],
      isCheckedIn: true,
      isVisible: true,
      interests: ['music', 'travel'],
      ageRangePreference: { min: 20, max: 30 },
      matches: [],
      likedUsers: [],
      blockedUsers: [],
      currentVenue: 'venue1',
    };

    // Mock potential users
    const potentialUsers: UserProfile[] = [
      {
        id: 'user2',
        name: 'Bob',
        age: 26,
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test bio',
        photos: [],
        isCheckedIn: true,
        isVisible: true,
        interests: ['music'],
        ageRangePreference: { min: 20, max: 30 },
        matches: [],
        likedUsers: [],
        blockedUsers: [],
        currentVenue: 'venue1',
      },
      {
        id: 'user3',
        name: 'Charlie',
        age: 27,
        gender: 'male',
        interestedIn: ['male'], // Not interested in females
        bio: 'Test bio',
        photos: [],
        isCheckedIn: true,
        isVisible: true,
        interests: ['travel'],
        ageRangePreference: { min: 20, max: 30 },
        matches: [],
        likedUsers: [],
        blockedUsers: [],
        currentVenue: 'venue1',
      },
    ];

    mockUserService.getUserProfile.mockResolvedValue(currentUserProfile);
    mockVenueService.getUsersAtVenue.mockResolvedValue(potentialUsers);

    const result = await matchingService.getPotentialMatches('user1', 10);

    // Should only return user2 (Bob) who is male and interested in females
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('user2');
    expect(result[0].name).toBe('Bob');
  });

  it('should filter users by age range preferences', async () => {
    const currentUserProfile: UserProfile = {
      id: 'user1',
      name: 'Alice',
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
      currentVenue: 'venue1',
    };

    const potentialUsers: UserProfile[] = [
      {
        id: 'user2',
        name: 'Bob',
        age: 26, // Within range
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test bio',
        photos: [],
        isCheckedIn: true,
        isVisible: true,
        interests: ['music'],
        ageRangePreference: { min: 20, max: 30 },
        matches: [],
        likedUsers: [],
        blockedUsers: [],
        currentVenue: 'venue1',
      },
      {
        id: 'user3',
        name: 'Charlie',
        age: 35, // Outside range
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test bio',
        photos: [],
        isCheckedIn: true,
        isVisible: true,
        interests: ['music'],
        ageRangePreference: { min: 20, max: 30 },
        matches: [],
        likedUsers: [],
        blockedUsers: [],
        currentVenue: 'venue1',
      },
    ];

    mockUserService.getUserProfile.mockResolvedValue(currentUserProfile);
    mockVenueService.getUsersAtVenue.mockResolvedValue(potentialUsers);

    const result = await matchingService.getPotentialMatches('user1', 10);

    // Should only return user2 (Bob) who is within age range
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('user2');
    expect(result[0].name).toBe('Bob');
  });

  it('should exclude already liked users', async () => {
    const currentUserProfile: UserProfile = {
      id: 'user1',
      name: 'Alice',
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
      likedUsers: ['user2'], // Already liked user2
      blockedUsers: [],
      currentVenue: 'venue1',
    };

    const potentialUsers: UserProfile[] = [
      {
        id: 'user2',
        name: 'Bob',
        age: 26,
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test bio',
        photos: [],
        isCheckedIn: true,
        isVisible: true,
        interests: ['music'],
        ageRangePreference: { min: 20, max: 30 },
        matches: [],
        likedUsers: [],
        blockedUsers: [],
        currentVenue: 'venue1',
      },
      {
        id: 'user3',
        name: 'Charlie',
        age: 27,
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test bio',
        photos: [],
        isCheckedIn: true,
        isVisible: true,
        interests: ['music'],
        ageRangePreference: { min: 20, max: 30 },
        matches: [],
        likedUsers: [],
        blockedUsers: [],
        currentVenue: 'venue1',
      },
    ];

    mockUserService.getUserProfile.mockResolvedValue(currentUserProfile);
    mockVenueService.getUsersAtVenue.mockResolvedValue(potentialUsers);

    const result = await matchingService.getPotentialMatches('user1', 10);

    // Should only return user3 (Charlie) since user2 is already liked
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('user3');
    expect(result[0].name).toBe('Charlie');
  });

  it('should exclude users with existing matches', async () => {
    const currentUserProfile: UserProfile = {
      id: 'user1',
      name: 'Alice',
      age: 25,
      gender: 'female',
      interestedIn: ['male'],
      bio: 'Test bio',
      photos: [],
      isCheckedIn: true,
      isVisible: true,
      interests: ['music'],
      ageRangePreference: { min: 20, max: 30 },
      matches: ['user2'], // Already matched with user2
      likedUsers: [],
      blockedUsers: [],
      currentVenue: 'venue1',
    };

    const potentialUsers: UserProfile[] = [
      {
        id: 'user2',
        name: 'Bob',
        age: 26,
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test bio',
        photos: [],
        isCheckedIn: true,
        isVisible: true,
        interests: ['music'],
        ageRangePreference: { min: 20, max: 30 },
        matches: ['user1'], // Already matched with user1
        likedUsers: [],
        blockedUsers: [],
        currentVenue: 'venue1',
      },
      {
        id: 'user3',
        name: 'Charlie',
        age: 27,
        gender: 'male',
        interestedIn: ['female'],
        bio: 'Test bio',
        photos: [],
        isCheckedIn: true,
        isVisible: true,
        interests: ['music'],
        ageRangePreference: { min: 20, max: 30 },
        matches: [],
        likedUsers: [],
        blockedUsers: [],
        currentVenue: 'venue1',
      },
    ];

    mockUserService.getUserProfile.mockResolvedValue(currentUserProfile);
    mockVenueService.getUsersAtVenue.mockResolvedValue(potentialUsers);

    const result = await matchingService.getPotentialMatches('user1', 10);

    // Should only return user3 (Charlie) since user2 is already matched
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('user3');
    expect(result[0].name).toBe('Charlie');
  });

  it('should return empty array when user is not checked in', async () => {
    const currentUserProfile: UserProfile = {
      id: 'user1',
      name: 'Alice',
      age: 25,
      gender: 'female',
      interestedIn: ['male'],
      bio: 'Test bio',
      photos: [],
      isCheckedIn: false,
      isVisible: true,
      interests: ['music'],
      ageRangePreference: { min: 20, max: 30 },
      matches: [],
      likedUsers: [],
      blockedUsers: [],
      // No currentVenue
    };

    mockUserService.getUserProfile.mockResolvedValue(currentUserProfile);

    const result = await matchingService.getPotentialMatches('user1', 10);

    expect(result).toHaveLength(0);
    expect(mockVenueService.getUsersAtVenue).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    mockUserService.getUserProfile.mockRejectedValue(new Error('Database error'));

    const result = await matchingService.getPotentialMatches('user1', 10);

    expect(result).toHaveLength(0);
  });
}); 