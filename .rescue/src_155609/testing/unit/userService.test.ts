import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '@/services';
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

      const result = await userService.createUser(mockUserData);

      expect(result).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith('User created successfully', expect.any(Object));
    });

    it('should handle user creation errors', async () => {
      const mockUserData = {
        email: 'invalid@example.com',
        name: 'Test User',
        age: 25,
      };

      // Mock the service to throw an error
      vi.mocked(userService.createUser).mockRejectedValueOnce(
        new Error('User already exists')
      );

      await expect(userService.createUser(mockUserData)).rejects.toThrow('User already exists');
      expect(logger.error).toHaveBeenCalledWith('Error creating user', expect.any(Error));
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

      const result = await userService.updateUser(userId, updateData);

      expect(result).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith('User updated successfully', expect.any(Object));
    });

    it('should handle update errors gracefully', async () => {
      const userId = 'user123';
      const updateData = { name: 'Test' };

      vi.mocked(userService.updateUser).mockRejectedValueOnce(
        new Error('User not found')
      );

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow('User not found');
      expect(logger.error).toHaveBeenCalledWith('Error updating user', expect.any(Error));
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID successfully', async () => {
      const userId = 'user123';

      const result = await userService.getUserById(userId);

      expect(result).toBeDefined();
      expect(logger.debug).toHaveBeenCalledWith('User retrieved successfully', expect.any(Object));
    });

    it('should return null for non-existent user', async () => {
      const userId = 'nonexistent';

      vi.mocked(userService.getUserById).mockResolvedValueOnce(null);

      const result = await userService.getUserById(userId);

      expect(result).toBeNull();
      expect(logger.debug).toHaveBeenCalledWith('User not found', { userId });
    });
  });

  describe('completeOnboarding', () => {
    it('should mark user onboarding as complete', async () => {
      const userId = 'user123';

      await userService.completeOnboarding(userId);

      expect(logger.info).toHaveBeenCalledWith('Onboarding completed for user', { userId });
    });

    it('should handle onboarding completion errors', async () => {
      const userId = 'user123';

      vi.mocked(userService.completeOnboarding).mockRejectedValueOnce(
        new Error('Failed to complete onboarding')
      );

      await expect(userService.completeOnboarding(userId)).rejects.toThrow('Failed to complete onboarding');
      expect(logger.error).toHaveBeenCalledWith('Error completing onboarding', expect.any(Error));
    });
  });
}); 