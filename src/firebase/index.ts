
// Import our mock implementation instead of the real Firebase
import * as firebaseMock from '../firebase.mock';

// Re-export everything from the mock
export const app = firebaseMock.app;
export const auth = firebaseMock.auth;
export const db = firebaseMock.db;
export const storage = firebaseMock.storage;
export const firestore = firebaseMock.db;

// Re-export helper functions
export const isFirebaseAvailable = firebaseMock.isFirebaseAvailable;
export const getFirestoreCollection = firebaseMock.getFirestoreCollection;

// Re-export Firestore methods
export const collection = firebaseMock.collection;
export const doc = firebaseMock.doc;
export const getDoc = firebaseMock.getDoc;
export const getDocs = firebaseMock.getDocs;
export const query = firebaseMock.query;
export const where = firebaseMock.where;
export const orderBy = firebaseMock.orderBy;
export const addDoc = firebaseMock.addDoc;
export const updateDoc = firebaseMock.updateDoc;
export const deleteDoc = firebaseMock.deleteDoc;
export const Timestamp = firebaseMock.Timestamp;
export const runTransaction = firebaseMock.runTransaction;
export const increment = firebaseMock.increment;
export const setDoc = firebaseMock.setDoc;

console.log('Using mock Firebase implementation');
