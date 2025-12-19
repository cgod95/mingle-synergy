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
import { firestore, storage } from '../../firebase';
import { UserProfile, UserService } from '@/types/services';
import { logError } from '@/utils/errorHandler';

type PartialUserProfile = Partial<UserProfile>;

class FirebaseUserService implements UserService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return { 
          uid: userSnap.id, // Set uid to the document ID
          displayName: userData.displayName || userData.name, // Use displayName if available, fallback to name
          ...(userData as UserProfile),
          id: userSnap.id // id comes last to override any id from userData
        };
      } else {
        return null;
      }
    } catch (error) {
      logError(error as Error, { source: 'userService', action: 'getUserProfile', userId });
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: PartialUserProfile): Promise<void> {
    if (!firestore) {
      throw new Error('Firebase is not initialized. Please refresh the page.');
    }
    
    if (!userId) {
      throw new Error('User ID is required to update profile.');
    }
    
    try {
      const userRef = doc(firestore, 'users', userId);
      // Use setDoc with merge: true instead of updateDoc to handle cases where document doesn't exist yet
      // This ensures the document is created if it doesn't exist, or updated if it does
      await setDoc(userRef, updates, { merge: true });
    } catch (error: any) {
      const errorCode = error?.code || '';
      const errorMessage = error?.message || '';
      
      logError(error as Error, { 
        source: 'userService', 
        action: 'updateUserProfile', 
        userId,
        errorCode,
        errorMessage
      });
      
      // Provide specific error messages based on error type
      if (errorCode === 'permission-denied') {
        throw new Error('Permission denied. Please ensure you are signed in and try again.');
      } else if (errorCode === 'unavailable' || errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (errorCode === 'deadline-exceeded' || errorMessage.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      } else {
        throw new Error('Failed to update profile. Please try again.');
      }
    }
  }

  async createUserProfile(userId: string, data: UserProfile): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', userId);
      await setDoc(userRef, data);
    } catch (error) {
      logError(error as Error, { source: 'userService', action: 'createUserProfile', userId });
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
    logError(new Error('User deletion not implemented'), { source: 'userService', action: 'deleteUser', userId });
  }

  async completeOnboarding(userId: string): Promise<void> {
    try {
      if (!firestore) {
        throw new Error('Firestore not available');
      }
      
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        onboardingComplete: true,
        onboardingCompletedAt: Date.now(),
      });
      
      // Also set localStorage for quick access
      localStorage.setItem('onboardingComplete', 'true');
    } catch (error) {
      logError(error as Error, { source: 'userService', action: 'completeOnboarding', userId });
      throw new Error('Failed to complete onboarding');
    }
  }

  async getUsersAtVenue(venueId: string): Promise<UserProfile[]> {
    try {
      // Return empty array if firestore is not available
      if (!firestore) {
        return [];
      }
      
      const usersRef = collection(firestore, 'users');
      // Filter by both currentVenue AND isCheckedIn to exclude stale check-ins
      const q = query(
        usersRef, 
        where('currentVenue', '==', venueId),
        where('isCheckedIn', '==', true)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      logError(error as Error, { source: 'userService', action: 'getUsersAtVenue', venueId });
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
      logError(error as Error, { source: 'userService', action: 'getReconnectRequests', userId });
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
      logError(error as Error, { source: 'userService', action: 'acceptReconnectRequest', userId, requesterId });
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
      logError(error as Error, { source: 'userService', action: 'removeLikesBetweenUsers', userId1, userId2 });
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
      logError(error as Error, { source: 'userService', action: 'sendReconnectRequest', fromUserId, toUserId });
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
      logError(error as Error, { source: 'userService', action: 'uploadProfilePhoto', userId });
      throw error;
    }
  }
}

export default new FirebaseUserService();