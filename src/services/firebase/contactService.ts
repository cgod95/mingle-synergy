
import { firestore } from '../firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

interface ContactInfo {
  type: 'phone' | 'instagram' | 'snapchat' | 'custom';
  value: string;
  sharedBy: string;
  sharedAt: string;
}

class ContactService {
  async shareContactInfo(matchId: string, contactInfo: ContactInfo): Promise<void> {
    try {
      const matchRef = doc(firestore, 'matches', matchId);
      
      await updateDoc(matchRef, {
        contactShared: true,
        contactInfo: contactInfo,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Contact info shared for match ${matchId}`);
    } catch (error) {
      console.error('Error sharing contact info:', error);
      throw new Error('Failed to share contact information');
    }
  }

  async toggleUserVisibility(userId: string, isVisible: boolean): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', userId);
      
      await updateDoc(userRef, {
        isVisible: isVisible,
        updatedAt: serverTimestamp()
      });
      
      console.log(`User ${userId} visibility set to ${isVisible}`);
    } catch (error) {
      console.error('Error updating visibility:', error);
      throw new Error('Failed to update visibility setting');
    }
  }

  async recordMeeting(matchId: string, userId: string, feedback?: { rating: number; notes?: string }): Promise<void> {
    try {
      const matchRef = doc(firestore, 'matches', matchId);
      
      await updateDoc(matchRef, {
        hasMet: true,
        metAt: serverTimestamp(),
        feedback: feedback ? {
          rating: feedback.rating,
          notes: feedback.notes,
          createdBy: userId,
          createdAt: serverTimestamp()
        } : null
      });
      
      console.log(`Meeting recorded for match ${matchId}`);
    } catch (error) {
      console.error('Error recording meeting:', error);
      throw new Error('Failed to record meeting');
    }
  }
}

export default new ContactService();
