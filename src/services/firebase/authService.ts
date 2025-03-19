
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase';
import { AuthService, UserCredential } from '@/types/services';

class FirebaseAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<UserCredential> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL,
        emailVerified: credential.user.emailVerified
      }
    };
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      user: {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL,
        emailVerified: credential.user.emailVerified
      }
    };
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await firebaseSendPasswordResetEmail(auth, email);
  }

  async getCurrentUser(): Promise<User | null> {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, callback);
  }
}

export default new FirebaseAuthService();
