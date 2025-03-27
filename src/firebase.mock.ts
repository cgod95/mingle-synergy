
// Mock Firebase app
export const app = {};

// Mock Firestore
export const db = null;

// Mock Auth
export const auth = null;

// Mock Storage
export const storage = null;

// Helper functions
export const isFirebaseAvailable = () => false;
export const getFirestoreCollection = () => null;

// Add this to ensure any import from firebase/* gets mock implementations
export const collection = () => null;
export const doc = () => null;
export const getDoc = async () => ({ exists: () => false, data: () => ({}) });
export const getDocs = async () => ({ docs: [] });
export const query = () => null;
export const where = () => null;
export const orderBy = () => null;
export const addDoc = async () => ({ id: `mock-${Date.now()}` });
export const updateDoc = async () => true;
export const deleteDoc = async () => true;
export const Timestamp = {
  now: () => ({ toDate: () => new Date() }),
  fromDate: (date: Date) => ({ toDate: () => date })
};
export const runTransaction = async (db: any, callback: Function) => {
  await callback({ get: async () => ({ exists: () => true, data: () => ({ remaining: 3 }) }) });
  return true;
};
export const increment = (num: number) => num;
export const setDoc = async () => true;
export const serverTimestamp = () => ({ toDate: () => new Date() });
export const arrayUnion = (...items: any[]) => items;
export const arrayRemove = (...items: any[]) => [];
export const limit = (n: number) => n;
export const startAfter = (doc: any) => doc;
export const endBefore = (doc: any) => doc;
export const writeBatch = () => ({
  set: () => {},
  update: () => {},
  delete: () => {},
  commit: async () => {}
});

// Additional Firebase Auth mock functions
export const createUserWithEmailAndPassword = async () => ({ 
  user: { uid: `mock-${Date.now()}`, email: 'mock@example.com' } 
});
export const signInWithEmailAndPassword = async () => ({ 
  user: { uid: `mock-${Date.now()}`, email: 'mock@example.com' } 
});
export const signInAnonymously = async () => ({ 
  user: { uid: `mock-${Date.now()}`, isAnonymous: true } 
});
export const signOut = async () => {};
export const sendPasswordResetEmail = async () => {};
export const onAuthStateChanged = () => () => {};
export const fetchSignInMethodsForEmail = async () => [];

// Firebase Storage mock functions
export const ref = () => ({});
export const uploadBytes = async () => {};
export const getDownloadURL = async () => "https://example.com/mock-image.jpg";
export const uploadString = async () => {};
export const deleteObject = async () => {};
