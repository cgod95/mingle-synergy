
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
  fromDate: (date) => ({ toDate: () => date })
};
export const runTransaction = async (db, callback) => {
  await callback({ get: async () => ({ exists: () => true, data: () => ({ remaining: 3 }) }) });
  return true;
};
export const increment = (num) => num;
export const setDoc = async () => true;
