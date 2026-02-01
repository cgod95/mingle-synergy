import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/config';
import { AuthService, UserCredential } from '@/types/services';
import { logError } from '@/utils/errorHandler';
import { logUserAction } from '@/utils/errorHandler';

const errorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already in use. Please try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email. Please sign up instead.',
  'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/invalid-login-credentials': 'Invalid email or password. Please try again.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/internal-error': 'An error occurred. Please try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
};

interface FirebaseErrorWithCode extends Error {
  code?: string;
}

class FirebaseAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      logUserAction('sign_in_attempt', { email });
      
      // Note: Removed deprecated fetchSignInMethodsForEmail check
      // Firebase v9+ handles user-not-found via signInWithEmailAndPassword directly
      
      const credential = await firebaseSignInWithEmailAndPassword(auth, email, password);
      logUserAction('sign_in_success', { userId: credential.user.uid });
      
      const userDoc = await getDoc(doc(firestore, 'users', credential.user.uid));
      
      if (!userDoc.exists()) {
        logUserAction('create_user_profile', { userId: credential.user.uid });
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
    } catch (error: unknown) {
      logError(error as Error, { source: 'auth', action: 'signIn', email });
      
      const firebaseError = error as FirebaseErrorWithCode;
      const errorMessage = errorMessages[firebaseError.code || ''] || 'Failed to sign in. Please check your credentials and try again.';
      throw new Error(errorMessage);
    }
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      // Note: Removed deprecated fetchSignInMethodsForEmail check
      // Firebase v9+ handles email-already-in-use via createUserWithEmailAndPassword directly
      
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
    } catch (error: unknown) {
      logError(error as Error, { source: 'auth', action: 'signUp', email });
      
      const firebaseError = error as FirebaseErrorWithCode;
      const errorMessage = errorMessages[firebaseError.code || ''] || 'Failed to sign up. Please try again.';
      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      logError(error as Error, { source: 'auth', action: 'sendPasswordResetEmail', email });
      
      const firebaseError = error as FirebaseErrorWithCode;
      const errorMessage = errorMessages[firebaseError.code || ''] || 'Failed to send password reset email. Please try again.';
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!auth) {
      logError(new Error('Auth not initialized'), { source: 'auth', action: 'onAuthStateChanged' });
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
