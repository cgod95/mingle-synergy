
import { firestore } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

class ContactService {
  async shareContactInfo(matchId: string, contactInfo: any): Promise<boolean> {
    try {
      const matchRef = doc(firestore, 'matches', matchId);
      
      await updateDoc(matchRef, {
        contactShared: true,
        contactInfo: contactInfo
      });
      
      return true;
    } catch (error) {
      console.error('Error sharing contact info:', error);
      return false;
    }
  }
}

export default new ContactService();
