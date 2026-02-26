import { collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, Timestamp, runTransaction, increment, setDoc } from 'firebase/firestore';

import { app, auth, firestore, storage } from './config';

const db = firestore;

const isFirebaseAvailable = () => !!app;
const getFirestoreCollection = (name: string) => collection(db, name);

export {
  app, auth, db, storage, firestore,
  isFirebaseAvailable, getFirestoreCollection,
  collection, doc, getDoc, getDocs, query, where, orderBy,
  addDoc, updateDoc, deleteDoc, Timestamp, runTransaction,
  increment, setDoc
};
