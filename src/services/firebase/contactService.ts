
import { firestore } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ContactInfo } from '@/types/contactInfo';
import { trackContactShared } from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';

class ContactService {
  async shareContactInfo(matchId: string, contactInfo: ContactInfo): Promise<boolean> {
    try {
      const matchRef = doc(firestore, 'matches', matchId);
      
      await updateDoc(matchRef, {
        contactShared: true,
        contactInfo: contactInfo
      });
      
      // Track analytics event
      trackContactShared(matchId);
      
      return true;
    } catch (error) {
      console.error('Error sharing contact info:', error);
      logError(error as Error, { matchId, contactInfo });
      return false;
    }
  }
}

export default new ContactService();
