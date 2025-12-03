import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
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
    return doc(firestore, 'onboarding', userId);
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
    } catch (error: any) {
      // If permission denied, document doesn't exist - return null to allow initialization
      if (error?.code === 'permission-denied') {
        logger.warn('Permission denied reading onboarding - document may not exist', { userId });
        return null;
      }
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
      // Only include data if it's provided and not undefined
      const stepUpdate: OnboardingStep = {
        id: stepId,
        completed: true,
        completedAt: Date.now(),
      };
      
      // Only add data field if stepData is provided and not undefined
      if (stepData && typeof stepData === 'object' && Object.keys(stepData).length > 0) {
        // Filter out undefined values from stepData
        const cleanData: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(stepData)) {
          if (value !== undefined) {
            cleanData[key] = value;
          }
        }
        if (Object.keys(cleanData).length > 0) {
          stepUpdate.data = cleanData;
        }
      }
      
      // Ensure steps object exists and filter out undefined values
      const existingSteps = existingData.steps || {};
      const updatedSteps: Record<string, OnboardingStep> = {};
      
      // Copy existing steps, filtering out undefined values
      for (const [key, step] of Object.entries(existingSteps)) {
        if (step && typeof step === 'object') {
          const cleanStep: Record<string, unknown> = {};
          for (const [stepKey, stepValue] of Object.entries(step)) {
            if (stepValue !== undefined) {
              cleanStep[stepKey] = stepValue;
            }
          }
          updatedSteps[key] = cleanStep as unknown as OnboardingStep;
        }
      }
      
      // Add/update the current step
      updatedSteps[stepId] = stepUpdate;

      // Determine if all steps are complete
      const allStepsComplete = ONBOARDING_STEPS.every(step => 
        updatedSteps[step]?.completed
      );

      // Build progress object, filtering out undefined values
      const updatedProgress: Record<string, unknown> = {
        ...existingData,
        steps: updatedSteps,
        currentStep: allStepsComplete ? 'complete' : stepId,
        isComplete: allStepsComplete,
        updatedAt: Date.now(),
      };
      
      // Only add completedAt if all steps are complete (don't include undefined)
      if (allStepsComplete) {
        updatedProgress.completedAt = Date.now();
      }
      
      // Filter out any undefined values that might have come from existingData
      const cleanProgress: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updatedProgress)) {
        if (value !== undefined) {
          // Also check nested objects (like steps)
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const cleanNested: Record<string, unknown> = {};
            for (const [nestedKey, nestedValue] of Object.entries(value as Record<string, unknown>)) {
              if (nestedValue !== undefined) {
                cleanNested[nestedKey] = nestedValue;
              }
            }
            cleanProgress[key] = cleanNested;
          } else {
            cleanProgress[key] = value;
          }
        }
      }

      await setDoc(onboardingRef, cleanProgress, { merge: true });
      
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

      const onboardingRef = this.getOnboardingDoc(userId);
      // Use setDoc WITHOUT merge for initial creation (treats as CREATE operation)
      await setDoc(onboardingRef, initialProgress);
      
      logger.info('Initialized onboarding for user', { userId });
      return initialProgress;
    } catch (error: any) {
      logger.error('Error initializing onboarding', error, { userId });
      // If permission denied, throw a more helpful error
      if (error?.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure you are signed in and try again.');
      }
      throw new Error('Failed to initialize onboarding');
    }
  }
}

export default new FirebaseOnboardingService(); 