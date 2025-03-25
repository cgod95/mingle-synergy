
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  increment,
  addDoc,
  getFirestore,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { UserProfile } from '@/types/services';

export interface User {
  id: string;
  name?: string;
  age?: number;
  photos: string[];
  bio?: string;
  occupation?: string;
  interests?: string[];
  gender?: string;
  interestedIn?: string[];
  isCheckedIn?: boolean;
  currentVenue?: string;
  isVisible?: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
}

class UserService {
  private db = firestore;
  
  // Get user profile
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return {
          id: userSnap.id,
          ...userSnap.data()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
  
  // Update user profile
  public async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<boolean> {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }
  
  // Get users at a venue
  public async getUsersAtVenue(venueId: string): Promise<UserProfile[]> {
    try {
      const usersQuery = query(
        collection(this.db, 'users'),
        where('currentVenue', '==', venueId),
        where('isVisible', '==', true)
      );
      
      const snapshot = await getDocs(usersQuery);
      
      const users: UserProfile[] = [];
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        } as UserProfile);
      });
      
      return users;
    } catch (error) {
      console.error('Error getting users at venue:', error);
      return [];
    }
  }
  
  // Update user visibility
  public async updateUserVisibility(userId: string, isVisible: boolean): Promise<boolean> {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        isVisible,
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user visibility:', error);
      return false;
    }
  }
  
  // Like a user
  public async likeUser(fromUserId: string, toUserId: string, venueId: string): Promise<boolean> {
    try {
      // First, check if we have remaining likes at this venue
      const likesRemaining = await this.getRemainingLikes(fromUserId, venueId);
      
      if (likesRemaining <= 0) {
        console.log('No likes remaining at this venue');
        return false;
      }
      
      // Create new interest document
      await addDoc(collection(this.db, 'interests'), {
        fromUserId,
        toUserId,
        venueId,
        timestamp: Date.now(),
        status: 'pending'
      });
      
      // Decrement likes remaining
      await this.decrementLikes(fromUserId, venueId);
      
      // Check if there's a mutual interest
      await this.checkForMutualInterest(fromUserId, toUserId, venueId);
      
      return true;
    } catch (error) {
      console.error('Error liking user:', error);
      return false;
    }
  }
  
  // Get remaining likes at a venue
  public async getRemainingLikes(userId: string, venueId: string): Promise<number> {
    try {
      // Check if we have a likes record for this user and venue
      const likesQuery = query(
        collection(this.db, 'likes'),
        where('userId', '==', userId),
        where('venueId', '==', venueId)
      );
      
      const snapshot = await getDocs(likesQuery);
      
      if (!snapshot.empty) {
        // We have a record, check the remaining count
        const likesDoc = snapshot.docs[0];
        const likesData = likesDoc.data();
        
        return likesData.remaining || 0;
      } else {
        // No record exists, create one with default limit (3)
        const DEFAULT_LIKES = 3;
        
        await addDoc(collection(this.db, 'likes'), {
          userId,
          venueId,
          remaining: DEFAULT_LIKES,
          timestamp: Date.now()
        });
        
        return DEFAULT_LIKES;
      }
    } catch (error) {
      console.error('Error getting remaining likes:', error);
      return 0;
    }
  }
  
  // Decrement likes counter
  private async decrementLikes(userId: string, venueId: string): Promise<void> {
    try {
      const likesQuery = query(
        collection(this.db, 'likes'),
        where('userId', '==', userId),
        where('venueId', '==', venueId)
      );
      
      const snapshot = await getDocs(likesQuery);
      
      if (!snapshot.empty) {
        const likesDoc = snapshot.docs[0];
        
        await updateDoc(doc(this.db, 'likes', likesDoc.id), {
          remaining: increment(-1)
        });
      }
    } catch (error) {
      console.error('Error decrementing likes:', error);
    }
  }
  
  // Check if there's a mutual interest
  private async checkForMutualInterest(user1Id: string, user2Id: string, venueId: string): Promise<void> {
    try {
      // Check if user2 has already liked user1
      const interestQuery = query(
        collection(this.db, 'interests'),
        where('fromUserId', '==', user2Id),
        where('toUserId', '==', user1Id)
      );
      
      const snapshot = await getDocs(interestQuery);
      
      if (!snapshot.empty) {
        // There's a mutual interest - create a match
        console.log('Mutual interest found! Creating a match...');
        
        // Get venue info for the match
        const venueRef = doc(this.db, 'venues', venueId);
        const venueSnap = await getDoc(venueRef);
        let venueInfo = null;
        
        if (venueSnap.exists()) {
          venueInfo = {
            id: venueSnap.id,
            ...venueSnap.data()
          };
        }
        
        // Use the MatchService to create a match
        const interest1 = {
          fromUserId: user1Id,
          toUserId: user2Id,
          venueId
        };
        
        const interest2 = {
          fromUserId: user2Id,
          toUserId: user1Id,
          venueId
        };
        
        // Assuming we have access to the matchService
        // await matchService.createMatch(interest1, interest2, venueInfo);
      }
    } catch (error) {
      console.error('Error checking for mutual interest:', error);
    }
  }
}

export const userService = new UserService();
