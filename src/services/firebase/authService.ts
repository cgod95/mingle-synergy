
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { AuthService, UserCredential } from '@/types/services';

// Error messages map for better user feedback
const errorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already in use. Please try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email. Please sign up instead.',
  'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.'
};

class FirebaseAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      // Check if user exists first to provide better error message
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length === 0) {
          throw new Error('No account found with this email. Would you like to sign up instead?');
        }
      } catch (error) {
        // Continue with sign in attempt even if this check fails
        console.warn('Failed to check if user exists:', error);
      }
      
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(firestore, 'users', credential.user.uid));
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(doc(firestore, 'users', credential.user.uid), {
          email,
          id: credential.user.uid,
          createdAt: new Date().toISOString(),
          photos: [],
          isCheckedIn: false,
          isVisible: true,
          interests: []
        });
      }
      
      return {
        user: {
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName,
          photoURL: credential.user.photoURL,
          emailVerified: credential.user.emailVerified
        }
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      const errorMessage = errorMessages[error.code] || 'Failed to sign in. Please check your credentials and try again.';
      throw new Error(errorMessage);
    }
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      // Check if user already exists
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          throw new Error(errorMessages['auth/email-already-in-use'] || 'This email is already registered.');
        }
      } catch (error: any) {
        // Only rethrow if it's not the "already exists" error
        if (error.code && error.code !== 'auth/email-already-in-use') {
          throw error;
        }
      }
      
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', credential.user.uid), {
        email,
        id: credential.user.uid,
        createdAt: new Date().toISOString(),
        photos: [],
        isCheckedIn: false,
        isVisible: true,
        interests: []
      });
      
      return {
        user: {
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName,
          photoURL: credential.user.photoURL,
          emailVerified: credential.user.emailVerified
        }
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      const errorMessage = errorMessages[error.code] || 'Failed to sign up. Please try again.';
      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      const errorMessage = errorMessages[error.code] || 'Failed to send password reset email. Please try again.';
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, callback);
  }
}

export default new FirebaseAuthService();
