
import { db } from '@/firebase';
import { VerificationService, VerificationStatus } from '@/types/services';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import logger from '@/utils/Logger';

class FirebaseVerificationService implements VerificationService {
  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      
      return {
        isVerified: userData.isVerified || false,
        pendingVerification: userData.pendingVerification || false,
        lastVerificationAttempt: userData.lastVerificationAttempt || null
      };
    } catch (error) {
      logger.error('Error getting verification status:', error);
      return {
        isVerified: false,
        pendingVerification: false,
        lastVerificationAttempt: null
      };
    }
  }
  
  async submitVerification(userId: string, selfieUrl: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      await updateDoc(userDocRef, {
        pendingVerification: true,
        lastVerificationAttempt: Date.now(),
        verificationSelfie: selfieUrl
      });
      
      // In a production app, this would trigger a Cloud Function to process the verification
      logger.info(`Verification submitted for user ${userId}`);
      
      return true;
    } catch (error) {
      logger.error('Error submitting verification:', error);
      return false;
    }
  }
  
  async shouldRequestVerification(userId: string): Promise<boolean> {
    try {
      const status = await this.getVerificationStatus(userId);
      
      // Request verification if user isn't verified and doesn't have a pending verification
      return !status.isVerified && !status.pendingVerification;
    } catch (error) {
      logger.error('Error checking if verification is needed:', error);
      return false;
    }
  }
}

export default new FirebaseVerificationService();
