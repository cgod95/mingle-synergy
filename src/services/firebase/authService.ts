import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/config';
import { AuthService, UserCredential } from '@/types/services';
import { logError } from '@/utils/errorHandler';

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
      console.log('Attempting sign in for:', email);
      
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        console.log('Available sign in methods:', signInMethods);
        if (signInMethods.length === 0) {
          throw new Error('No account found with this email. Would you like to sign up instead?');
        }
      } catch (error: any) {
        console.warn('Failed to check if user exists:', error);
        if (error.code && error.code !== 'auth/user-not-found') {
          throw error;
        }
      }
      
      const credential = await firebaseSignInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful for user:', credential.user.uid);
      
      const userDoc = await getDoc(doc(firestore, 'users', credential.user.uid));
      
      if (!userDoc.exists()) {
        console.log('Creating new user profile in Firestore');
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
      logError(error, { source: 'auth', action: 'signIn' });
      
      const errorMessage = errorMessages[error.code] || 'Failed to sign in. Please check your credentials and try again.';
      throw new Error(errorMessage);
    }
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          throw new Error(errorMessages['auth/email-already-in-use'] || 'This email is already registered.');
        }
      } catch (error: any) {
        if (error.code && error.code !== 'auth/email-already-in-use') {
          throw error;
        }
      }
      
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
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
    if (!auth) {
      console.warn('Auth not initialized, using mock implementation');
      return () => {};
    }
    return firebaseOnAuthStateChanged(auth, callback);
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return this.signIn(email, password);
  }

  async signUpWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return this.signUp(email, password);
  }
}

export default new FirebaseAuthService();
