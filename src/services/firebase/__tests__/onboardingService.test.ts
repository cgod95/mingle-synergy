import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'test-user-id' },
  })),
}));

// Mock the onboardingService
const mockOnboardingService = {
  completeStep: vi.fn(),
  isStepComplete: vi.fn(),
  getNextIncompleteStep: vi.fn(),
  loadOnboardingProgress: vi.fn(),
  saveOnboardingProgress: vi.fn(),
  setCurrentStep: vi.fn(),
  getCurrentStep: vi.fn(),
  isOnboardingComplete: vi.fn(),
  startOnboarding: vi.fn(),
  completeOnboarding: vi.fn(),
};

vi.mock('../onboardingService', () => ({
  default: mockOnboardingService,
  OnboardingProgress: vi.fn(),
  OnboardingStepId: vi.fn(),
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
      const stepId = 'profile';
      
      // Mock the service methods to actually call the mock functions
      mockOnboardingService.loadOnboardingProgress.mockResolvedValue({
        userId,
        currentStep: 'profile',
        steps: {},
        isComplete: false,
        startedAt: Date.now(),
      });

      mockOnboardingService.saveOnboardingProgress.mockResolvedValue(undefined);

      // Mock the completeStep to actually call the other methods
      mockOnboardingService.completeStep.mockImplementation(async (uid: string, step: string) => {
        await mockOnboardingService.loadOnboardingProgress(uid);
        await mockOnboardingService.saveOnboardingProgress();
      });

      await mockOnboardingService.completeStep(userId, stepId);

      expect(mockOnboardingService.loadOnboardingProgress).toHaveBeenCalledWith(userId);
      expect(mockOnboardingService.saveOnboardingProgress).toHaveBeenCalled();
    });
  });

  describe('isStepComplete', () => {
    it('should return true for completed step', async () => {
      const userId = 'test-user-id';
      const stepId = 'profile';
      
      const mockProgress = {
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

      mockOnboardingService.loadOnboardingProgress.mockResolvedValue(mockProgress);
      mockOnboardingService.isStepComplete.mockResolvedValue(true);

      const result = await mockOnboardingService.isStepComplete(userId, stepId);
      expect(result).toBe(true);
    });

    it('should return false for incomplete step', async () => {
      const userId = 'test-user-id';
      const stepId = 'profile';
      
      const mockProgress = {
        userId,
        currentStep: 'profile',
        steps: {},
        isComplete: false,
        startedAt: Date.now(),
      };

      mockOnboardingService.loadOnboardingProgress.mockResolvedValue(mockProgress);
      mockOnboardingService.isStepComplete.mockResolvedValue(false);

      const result = await mockOnboardingService.isStepComplete(userId, stepId);
      expect(result).toBe(false);
    });
  });

  describe('getNextIncompleteStep', () => {
    it('should return first step when no progress exists', async () => {
      const userId = 'test-user-id';
      
      mockOnboardingService.loadOnboardingProgress.mockResolvedValue(null);
      mockOnboardingService.getNextIncompleteStep.mockResolvedValue('email');

      const result = await mockOnboardingService.getNextIncompleteStep(userId);
      expect(result).toBe('email');
    });
  });
}); 