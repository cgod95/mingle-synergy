import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import logger from '@/utils/Logger';

// Onboarding step definitions
export const ONBOARDING_STEPS = [
  'profile',
  'photos', 
  'preferences',
  'complete'
] as const;

export interface OnboardingStep {
  id: string;
  completed: boolean;
  completedAt?: number;
  data?: Record<string, unknown>; // Store step-specific data
}

export interface OnboardingProgress {
  userId: string;
  currentStep: string;
  steps: Record<string, OnboardingStep>;
  isComplete: boolean;
  startedAt: number;
  completedAt?: number;
}

export type OnboardingStepId = typeof ONBOARDING_STEPS[number];

class FirebaseOnboardingService {
  private getOnboardingDoc(userId: string) {
    return doc(db, 'onboarding', userId);
  }

  /**
   * Save onboarding progress to Firebase
   */
  async saveOnboardingProgress(
    userId: string, 
    progress: Partial<OnboardingProgress>
  ): Promise<void> {
    try {
      const onboardingRef = this.getOnboardingDoc(userId);
      
      // Get existing data to merge
      const existingDoc = await getDoc(onboardingRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : {};
      
      const updatedProgress = {
        ...existingData,
        ...progress,
        userId,
        updatedAt: Date.now(),
      };

      await setDoc(onboardingRef, updatedProgress, { merge: true });
      
      logger.info('Onboarding progress saved', { userId, progress: updatedProgress });
    } catch (error) {
      logger.error('Error saving onboarding progress', error, { userId });
      throw new Error('Failed to save onboarding progress');
    }
  }

  /**
   * Load onboarding progress from Firebase
   */
  async loadOnboardingProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      const onboardingRef = this.getOnboardingDoc(userId);
      const doc = await getDoc(onboardingRef);
      
      if (doc.exists()) {
        const data = doc.data() as OnboardingProgress;
        logger.debug('Onboarding progress loaded', { userId, data });
        return data;
      }
      
      return null;
    } catch (error) {
      logger.error('Error loading onboarding progress', error, { userId });
      return null;
    }
  }

  /**
   * Mark a specific step as complete
   */
  async completeStep(
    userId: string, 
    stepId: OnboardingStepId, 
    stepData?: Record<string, unknown>
  ): Promise<void> {
    try {
      const onboardingRef = this.getOnboardingDoc(userId);
      
      // Get existing progress
      const existingDoc = await getDoc(onboardingRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : {};
      
      // Update the specific step
      const updatedSteps = {
        ...existingData.steps,
        [stepId]: {
          id: stepId,
          completed: true,
          completedAt: Date.now(),
          data: stepData,
        }
      };

      // Determine if all steps are complete
      const allStepsComplete = ONBOARDING_STEPS.every(step => 
        updatedSteps[step]?.completed
      );

      const updatedProgress = {
        ...existingData,
        steps: updatedSteps,
        currentStep: allStepsComplete ? 'complete' : stepId,
        isComplete: allStepsComplete,
        completedAt: allStepsComplete ? Date.now() : undefined,
        updatedAt: Date.now(),
      };

      await setDoc(onboardingRef, updatedProgress, { merge: true });
      
      logger.info('Onboarding step completed', { userId, stepId, updatedProgress });
    } catch (error) {
      logger.error('Error completing onboarding step', error, { userId, stepId });
      throw new Error(`Failed to complete step: ${stepId}`);
    }
  }

  /**
   * Set current step (for navigation tracking)
   */
  async setCurrentStep(userId: string, stepId: OnboardingStepId): Promise<void> {
    try {
      const onboardingRef = this.getOnboardingDoc(userId);
      
      await updateDoc(onboardingRef, {
        currentStep: stepId,
        updatedAt: Date.now(),
      });
      
      logger.debug('Current onboarding step set', { userId, stepId });
    } catch (error) {
      logger.error('Error setting current onboarding step', error, { userId, stepId });
      throw new Error(`Failed to set current step: ${stepId}`);
    }
  }

  /**
   * Check if a specific step is complete
   */
  async isStepComplete(userId: string, stepId: OnboardingStepId): Promise<boolean> {
    try {
      const progress = await this.loadOnboardingProgress(userId);
      return progress?.steps?.[stepId]?.completed || false;
    } catch (error) {
      logger.error('Error checking step completion', error, { userId, stepId });
      return false;
    }
  }

  /**
   * Get the next incomplete step
   */
  async getNextIncompleteStep(userId: string): Promise<OnboardingStepId | null> {
    try {
      const progress = await this.loadOnboardingProgress(userId);
      
      if (!progress) {
        return ONBOARDING_STEPS[0]; // Start with first step
      }

      for (const step of ONBOARDING_STEPS) {
        if (!progress.steps?.[step]?.completed) {
          return step;
        }
      }
      
      return null; // All steps complete
    } catch (error) {
      logger.error('Error getting next step', error, { userId });
      return ONBOARDING_STEPS[0];
    }
  }

  /**
   * Reset onboarding progress (for testing or restart)
   */
  async resetOnboardingProgress(userId: string): Promise<void> {
    try {
      const onboardingRef = this.getOnboardingDoc(userId);
      
      await setDoc(onboardingRef, {
        userId,
        currentStep: ONBOARDING_STEPS[0],
        steps: {},
        isComplete: false,
        startedAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      logger.info('Onboarding progress reset for user', { userId });
    } catch (error) {
      logger.error('Error resetting onboarding progress', error, { userId });
      throw new Error('Failed to reset onboarding progress');
    }
  }

  /**
   * Sync onboarding progress with user profile
   */
  async syncWithUserProfile(userId: string): Promise<void> {
    try {
      const progress = await this.loadOnboardingProgress(userId);
      
      if (progress?.isComplete) {
        // Update user profile to mark onboarding as complete
        const userService = (await import('./userService')).default;
        await userService.completeOnboarding(userId);
        
        logger.info('Synced onboarding with user profile - onboarding complete', { userId });
      }
    } catch (error) {
      logger.error('Error syncing onboarding with user profile', error, { userId });
    }
  }

  /**
   * Initialize onboarding progress for a new user
   */
  async initializeOnboarding(userId: string): Promise<OnboardingProgress> {
    try {
      const initialProgress: OnboardingProgress = {
        userId,
        currentStep: ONBOARDING_STEPS[0],
        steps: {},
        isComplete: false,
        startedAt: Date.now(),
      };

      await this.saveOnboardingProgress(userId, initialProgress);
      
      logger.info('Initialized onboarding for user', { userId });
      return initialProgress;
    } catch (error) {
      logger.error('Error initializing onboarding', error, { userId });
      throw new Error('Failed to initialize onboarding');
    }
  }
}

export default new FirebaseOnboardingService(); 