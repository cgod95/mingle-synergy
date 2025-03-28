
// Import from real Firebase SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, Timestamp, runTransaction, increment, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Import our Firebase configuration
import { firebase } from './config';

// Use the initialized Firebase instance from the config
const app = firebase.app || initializeApp({});
const auth = firebase.auth;
const db = firebase.db;
const storage = firebase.storage;
const firestore = db;

// Helper functions
const isFirebaseAvailable = () => firebase.initialized;
const getFirestoreCollection = (name) => firebase.getCollection(name);

console.log('Using real Firebase implementation');

// Export everything
export {
  app, auth, db, storage, firestore,
  isFirebaseAvailable, getFirestoreCollection,
  collection, doc, getDoc, getDocs, query, where, orderBy,
  addDoc, updateDoc, deleteDoc, Timestamp, runTransaction,
  increment, setDoc
};
