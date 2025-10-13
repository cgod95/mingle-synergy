import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  UserCredential as FirebaseUserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { User, UserCredential } from '@/types/services';
import logger from '@/utils/Logger';

// Error message mapping
const AUTH_ERROR_MESSAGES = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/operation-not-allowed': 'This operation is not allowed.',
  'auth/invalid-credential': 'Invalid credentials. Please try again.',
};

class AuthService {
  private auth = getAuth();

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await this.createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      });
      
      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        },
        uid: user.uid
      };
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage((error as { code?: string }).code || '');
      logger.error('Sign up error:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        },
        uid: user.uid
      };
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage((error as { code?: string }).code || '');
      logger.error('Sign in error:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      logger.info('Password reset email sent');
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage((error as { code?: string }).code || '');
      logger.error('Password reset error:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Sign in with email and password (alias for signIn)
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return this.signIn(email, password);
  }

  /**
   * Sign up with email and password (alias for signUp)
   */
  async signUpWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return this.signUp(email, password);
  }

  /**
   * Create user profile in Firestore
   */
  private async createUserProfile(uid: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      logger.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Get error message from Firebase error code
   */
  private getErrorMessage(errorCode: string): string {
    return AUTH_ERROR_MESSAGES[errorCode as keyof typeof AUTH_ERROR_MESSAGES] || 
           'An unexpected error occurred. Please try again.';
  }
}

export default new AuthService();
