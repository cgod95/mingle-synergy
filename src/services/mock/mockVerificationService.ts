
import { VerificationStatus } from '../firebase/verificationService';

class MockVerificationService {
  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    console.log(`[Mock] Getting verification status for user ${userId}`);
    
    // In mock mode, assume users are not verified initially
    return {
      isVerified: false,
      pendingVerification: false,
      lastVerificationAttempt: null
    };
  }
  
  async submitVerification(userId: string, selfieUrl: string): Promise<boolean> {
    console.log(`[Mock] Submitting verification for user ${userId}`);
    console.log(`[Mock] Selfie URL: ${selfieUrl}`);
    
    // Always succeed in mock mode
    return true;
  }
  
  async shouldRequestVerification(userId: string): Promise<boolean> {
    console.log(`[Mock] Checking if verification is needed for user ${userId}`);
    
    // In mock mode, always request verification
    return true;
  }
}

export default new MockVerificationService();
