
import { firestore } from '@/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { ContactInfo } from '@/types/contactInfo';
import { analytics } from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';

class ContactService {
  async shareContactInfo(matchId: string, contactInfo: ContactInfo): Promise<boolean> {
    try {
      const matchRef = doc(firestore, 'matches', matchId);
      
      await updateDoc(matchRef, {
        contactShared: true,
        contactInfo: JSON.stringify(contactInfo)
      });
      
      // Track analytics event
      analytics.track('contact_shared', { matchId });
      
      return true;
    } catch (error) {
      console.error('Error sharing contact info:', error);
      logError(error as Error, { matchId });
      return false;
    }
  }
}

export default new ContactService();
