import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../firebase/index';
import { UserProfile, UserService } from '@/types/services';

type PartialUserProfile = Partial<UserProfile>;

class FirebaseUserService implements UserService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return { 
          id: userSnap.id, 
          uid: userSnap.id, // Set uid to the document ID
          displayName: userData.displayName || userData.name, // Use displayName if available, fallback to name
          ...(userData as UserProfile) 
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: PartialUserProfile): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  async createUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', userId);
      await setDoc(userRef, {
        ...data,
        isOnboardingComplete: false, // 🔒 prevent routing to /venues prematurely
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create profile. Please try again.');
    }
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    return this.getUserProfile(userId);
  }

  async updateUser(userId: string, data: PartialUserProfile): Promise<void> {
    return this.updateUserProfile(userId, data);
  }

  async deleteUser(userId: string): Promise<void> {
    // Note: In production, you might want to use a Cloud Function to handle user deletion
    // as it requires special permissions and cleanup of related data
    console.warn('User deletion not implemented - use Cloud Functions for production');
  }

  async getUsersAtVenue(venueId: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('currentVenue', '==', venueId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      console.error('Error fetching users at venue:', error);
      return [];
    }
  }

  async getReconnectRequests(userId: string): Promise<string[]> {
    try {
      // Approach 1: Get from user document array (simpler for small scale)
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.reconnectRequests || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching reconnect requests:', error);
      return [];
    }
  }

  async acceptReconnectRequest(userId: string, requesterId: string): Promise<void> {
    try {
      // Remove the request from the user's reconnectRequests array
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        reconnectRequests: arrayRemove(requesterId)
      });

      // Create a new match between the users
      const matchService = (await import('./matchService')).default;
      // For reconnection, we'll use a default venue since we don't have venue context
      // In a real app, you might want to store venue info with the reconnect request
      await matchService.createMatch(userId, requesterId, 'reconnect-venue', 'Reconnection');

      // Remove likes between users to allow fresh matching
      await this.removeLikesBetweenUsers(userId, requesterId);
    } catch (error) {
      console.error('Error accepting reconnect request:', error);
      throw error;
    }
  }

  private async removeLikesBetweenUsers(userId1: string, userId2: string): Promise<void> {
    try {
      // Remove likes from both users
      const user1Ref = doc(firestore, 'users', userId1);
      const user2Ref = doc(firestore, 'users', userId2);

      await updateDoc(user1Ref, {
        likes: arrayRemove(userId2)
      });

      await updateDoc(user2Ref, {
        likes: arrayRemove(userId1)
      });
    } catch (error) {
      console.error('Error removing likes between users:', error);
    }
  }

  async sendReconnectRequest(fromUserId: string, toUserId: string): Promise<void> {
    try {
      // Add the requesting user to the target user's reconnectRequests array
      const targetUserRef = doc(firestore, 'users', toUserId);
      await updateDoc(targetUserRef, {
        reconnectRequests: arrayUnion(fromUserId)
      });
    } catch (error) {
      console.error('Error sending reconnect request:', error);
      throw error;
    }
  }

  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    try {
      // Create a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-photos/${userId}/${Date.now()}.${fileExtension}`;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Get current user profile to update photos array
      const currentProfile = await this.getUserProfile(userId);
      const currentPhotos = currentProfile?.photos || [];
      
      // Update user profile with the new photo URL
      await this.updateUserProfile(userId, {
        photos: [...currentPhotos, downloadURL]
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  // 🧠 Purpose: Mark onboarding as complete after preferences are saved
  async completeOnboarding(userId: string): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        isOnboardingComplete: true,
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw new Error('Failed to complete onboarding. Please try again.');
    }
  }

  // 🧠 Purpose: Check if user has completed onboarding
  async isOnboardingComplete(userId: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(userId);
      return userProfile?.isOnboardingComplete || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  // 🧠 Purpose: Mark onboarding as complete
  async markOnboardingComplete(userId: string): Promise<void> {
    return this.completeOnboarding(userId);
  }
}

export default new FirebaseUserService();