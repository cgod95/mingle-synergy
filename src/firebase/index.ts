
// Import from real Firebase SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, Timestamp, runTransaction, increment, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Import our Firebase configuration
import { app, auth, firestore, storage } from './config';

// Use the initialized Firebase instance from the config
const db = firestore;

// Helper functions
const isFirebaseAvailable = () => !!app;
const getFirestoreCollection = (name: string) => collection(db, name);

// Export everything
export {
  app, auth, db, storage, firestore,
  isFirebaseAvailable, getFirestoreCollection,
  collection, doc, getDoc, getDocs, query, where, orderBy,
  addDoc, updateDoc, deleteDoc, Timestamp, runTransaction,
  increment, setDoc
};
