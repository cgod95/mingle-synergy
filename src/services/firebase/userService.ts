
import { firestore } from '../firebase';
import { UserService, UserProfile } from '@/types/services';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Helper function to ensure consistent data structure
const transformFirestoreUser = (firestoreData: any, userId: string): UserProfile => {
  return {
    id: userId,
    name: firestoreData?.name || '',
    photos: firestoreData?.photos || [],
    bio: firestoreData?.bio || '',
    isCheckedIn: firestoreData?.isCheckedIn || false,
    currentVenue: firestoreData?.currentVenue || undefined,
    currentZone: firestoreData?.currentZone || undefined,
    isVisible: firestoreData?.isVisible || true,
    interests: firestoreData?.interests || [],
    gender: firestoreData?.gender || 'other',
    interestedIn: firestoreData?.interestedIn || [],
    age: firestoreData?.age || 25,
    ageRangePreference: firestoreData?.ageRangePreference || { min: 18, max: 40 },
    matches: firestoreData?.matches || [],
    likedUsers: firestoreData?.likedUsers || [],
    blockedUsers: firestoreData?.blockedUsers || [],
  };
};

class FirebaseUserService implements UserService {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log(`No user found with id: ${userId}`);
        return null;
      }
      
      return transformFirestoreUser(userDoc.data(), userId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      
      // Add updatedAt timestamp
      const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, dataWithTimestamp);
      console.log(`User ${userId} updated successfully`);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  async createUserProfile(userId: string, data: UserProfile): Promise<void> {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      
      // Add timestamps
      const dataWithTimestamps = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userDocRef, dataWithTimestamps);
      console.log(`User ${userId} created successfully`);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }
  
  // Additional method that could be useful for venue-related features
  async getUsersAtVenue(venueId: string): Promise<UserProfile[]> {
    try {
      const usersCollectionRef = collection(firestore, 'users');
      const venueUsersQuery = query(
        usersCollectionRef,
        where('isCheckedIn', '==', true),
        where('currentVenue', '==', venueId)
      );
      
      const querySnapshot = await getDocs(venueUsersQuery);
      return querySnapshot.docs.map(doc => 
        transformFirestoreUser(doc.data(), doc.id)
      );
    } catch (error) {
      console.error('Error fetching users at venue:', error);
      return [];
    }
  }
}

export default new FirebaseUserService();
