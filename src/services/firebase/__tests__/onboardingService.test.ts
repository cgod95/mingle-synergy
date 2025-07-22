import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import onboardingService, { OnboardingProgress, OnboardingStepId } from '../onboardingService';

// Mock Firebase
vi.mock('../../firebase/index', () => ({
  firestore: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
  auth: {
    currentUser: { uid: 'test-user-id' },
  },
}));

describe('FirebaseOnboardingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('completeStep', () => {
    it('should mark a step as complete', async () => {
      const userId = 'test-user-id';
      const stepId: OnboardingStepId = 'profile';
      
      // Mock the service methods
      const mockLoadProgress = vi.spyOn(onboardingService, 'loadOnboardingProgress')
        .mockResolvedValue({
          userId,
          currentStep: 'profile',
          steps: {},
          isComplete: false,
          startedAt: Date.now(),
        });

      const mockSaveProgress = vi.spyOn(onboardingService, 'saveOnboardingProgress')
        .mockResolvedValue();

      await onboardingService.completeStep(userId, stepId);

      expect(mockLoadProgress).toHaveBeenCalledWith(userId);
      expect(mockSaveProgress).toHaveBeenCalled();
    });
  });

  describe('isStepComplete', () => {
    it('should return true for completed step', async () => {
      const userId = 'test-user-id';
      const stepId: OnboardingStepId = 'profile';
      
      const mockProgress: OnboardingProgress = {
        userId,
        currentStep: 'profile',
        steps: {
          profile: {
            id: 'profile',
            completed: true,
            completedAt: Date.now(),
          },
        },
        isComplete: false,
        startedAt: Date.now(),
      };

      vi.spyOn(onboardingService, 'loadOnboardingProgress')
        .mockResolvedValue(mockProgress);

      const result = await onboardingService.isStepComplete(userId, stepId);
      expect(result).toBe(true);
    });

    it('should return false for incomplete step', async () => {
      const userId = 'test-user-id';
      const stepId: OnboardingStepId = 'profile';
      
      const mockProgress: OnboardingProgress = {
        userId,
        currentStep: 'profile',
        steps: {},
        isComplete: false,
        startedAt: Date.now(),
      };

      vi.spyOn(onboardingService, 'loadOnboardingProgress')
        .mockResolvedValue(mockProgress);

      const result = await onboardingService.isStepComplete(userId, stepId);
      expect(result).toBe(false);
    });
  });

  describe('getNextIncompleteStep', () => {
    it('should return first step when no progress exists', async () => {
      const userId = 'test-user-id';
      
      vi.spyOn(onboardingService, 'loadOnboardingProgress')
        .mockResolvedValue(null);

      const result = await onboardingService.getNextIncompleteStep(userId);
      expect(result).toBe('profile');
    });

    it('should return next incomplete step', async () => {
      const userId = 'test-user-id';
      
      const mockProgress: OnboardingProgress = {
        userId,
        currentStep: 'photos',
        steps: {
          profile: {
            id: 'profile',
            completed: true,
            completedAt: Date.now(),
          },
        },
        isComplete: false,
        startedAt: Date.now(),
      };

      vi.spyOn(onboardingService, 'loadOnboardingProgress')
        .mockResolvedValue(mockProgress);

      const result = await onboardingService.getNextIncompleteStep(userId);
      expect(result).toBe('photos');
    });

    it('should return null when all steps are complete', async () => {
      const userId = 'test-user-id';
      
      const mockProgress: OnboardingProgress = {
        userId,
        currentStep: 'complete',
        steps: {
          profile: {
            id: 'profile',
            completed: true,
            completedAt: Date.now(),
          },
          photos: {
            id: 'photos',
            completed: true,
            completedAt: Date.now(),
          },
          preferences: {
            id: 'preferences',
            completed: true,
            completedAt: Date.now(),
          },
          verification: {
            id: 'verification',
            completed: true,
            completedAt: Date.now(),
          },
        },
        isComplete: true,
        startedAt: Date.now(),
        completedAt: Date.now(),
      };

      vi.spyOn(onboardingService, 'loadOnboardingProgress')
        .mockResolvedValue(mockProgress);

      const result = await onboardingService.getNextIncompleteStep(userId);
      expect(result).toBe(null);
    });
  });
}); 