
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ContactInfo } from '@/types/contactInfo';
import { trackContactShared } from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';
import logger from '@/utils/Logger';

class ContactService {
  async shareContactInfo(matchId: string, contactInfo: ContactInfo): Promise<boolean> {
    try {
      const matchRef = doc(db, 'matches', matchId);
      
      await updateDoc(matchRef, {
        contactShared: true,
        contactInfo: contactInfo
      });
      
      // Track analytics event
      trackContactShared(matchId);
      
      return true;
    } catch (error) {
      logger.error('Error sharing contact info:', error);
      logError(error as Error, { matchId, contactInfo });
      return false;
    }
  }
}

export default new ContactService();
