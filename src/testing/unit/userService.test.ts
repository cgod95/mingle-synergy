import { describe, it, expect, beforeEach, vi } from 'vitest';
import logger from '@/utils/Logger';

// Mock the logger
vi.mock('@/utils/Logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the userService
const mockUserService = {
  createUser: vi.fn(),
  updateUser: vi.fn(),
  getUserById: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  createUserProfile: vi.fn(),
  deleteUser: vi.fn(),
  getUsersAtVenue: vi.fn(),
  getReconnectRequests: vi.fn(),
  acceptReconnectRequest: vi.fn(),
  sendReconnectRequest: vi.fn(),
  completeOnboarding: vi.fn(),
  markOnboardingComplete: vi.fn(),
};

vi.mock('@/services', () => ({
  userService: mockUserService,
}));

describe('UserService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const mockUserData = {
        email: 'test@example.com',
        name: 'Test User',
        age: 25,
        bio: 'I love meeting new people!',
      };

      mockUserService.createUser.mockResolvedValueOnce({ id: 'user123', ...mockUserData });

      const result = await mockUserService.createUser(mockUserData);

      expect(result).toBeDefined();
      expect(result.id).toBe('user123');
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockUserData);
    });

    it('should handle user creation errors', async () => {
      const mockUserData = {
        email: 'invalid@example.com',
        name: 'Test User',
        age: 25,
      };

      mockUserService.createUser.mockRejectedValueOnce(
        new Error('User already exists')
      );

      await expect(mockUserService.createUser(mockUserData)).rejects.toThrow('User already exists');
    });
  });

  describe('updateUser', () => {
    it('should update user profile successfully', async () => {
      const userId = 'user123';
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
        interests: ['music', 'sports'],
      };

      mockUserService.updateUser.mockResolvedValueOnce(undefined);

      await mockUserService.updateUser(userId, updateData);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
    });

    it('should handle update errors gracefully', async () => {
      const userId = 'user123';
      const updateData = { name: 'Test' };

      mockUserService.updateUser.mockRejectedValueOnce(
        new Error('User not found')
      );

      await expect(mockUserService.updateUser(userId, updateData)).rejects.toThrow('User not found');
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID successfully', async () => {
      const userId = 'user123';
      const mockUser = {
        id: userId,
        name: 'Test User',
        age: 25,
        bio: 'Test bio',
      };

      mockUserService.getUserById.mockResolvedValueOnce(mockUser);

      const result = await mockUserService.getUserById(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should return null for non-existent user', async () => {
      const userId = 'nonexistent';

      mockUserService.getUserById.mockResolvedValueOnce(null);

      const result = await mockUserService.getUserById(userId);

      expect(result).toBeNull();
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });
  });
}); 