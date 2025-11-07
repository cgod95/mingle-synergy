import { AuthService, User, UserCredential } from '@/types/services';

// Mock user data for testing
const mockUsers: Record<string, { email: string; password: string; user: User }> = {
  'test@example.com': {
    email: 'test@example.com',
    password: 'password123',
    user: {
      uid: 'mock-user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      emailVerified: true
    }
  }
};

class MockAuthService implements AuthService {
  // Load user from localStorage if available
  private currentUser: User | null = (() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : mockUsers['test@example.com'].user;
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
      return mockUsers['test@example.com'].user;
    }
  })();
  
  private listeners: ((user: User | null) => void)[] = [];

  async signIn(email: string, password: string): Promise<UserCredential> {
    const mockUser = mockUsers[email];
    
    if (!mockUser || mockUser.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    this.currentUser = mockUser.user;
    localStorage.setItem('currentUser', JSON.stringify(mockUser.user));
    this.notifyListeners();
    
    return { user: mockUser.user };
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    if (mockUsers[email]) {
      throw new Error('Email already in use');
    }
    
    const newUser: User = {
      uid: `mock-user-${Object.keys(mockUsers).length + 1}`,
      email,
      displayName: null,
      photoURL: null,
      emailVerified: false
    };
    
    mockUsers[email] = { email, password, user: newUser };
    this.currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    this.notifyListeners();
    
    return { user: newUser };
  }

  async signOut(): Promise<void> {
    // For development, don't actually sign out
    console.log('Sign out called but bypassed for development');
    // Don't actually clear the user for demo purposes
    // this.currentUser = null;
    // localStorage.removeItem('currentUser');
    // this.notifyListeners();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    if (!mockUsers[email]) {
      throw new Error('No user found with this email');
    }
    
    console.log(`Password reset email sent to ${email}`);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    
    // Initial callback with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return this.signIn(email, password);
  }

  async signUpWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    return this.signUp(email, password);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export default new MockAuthService();
