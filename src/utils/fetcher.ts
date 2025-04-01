// utils/fetcher.ts
import { DocumentData, DocumentReference, Query, getDoc, getDocs } from 'firebase/firestore';

// Generic fetch wrapper
export const fetcher = async <T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
};

// Firebase-specific fetcher
export const firebaseFetcher = {
  // Get a single document by reference
  getDoc: async (docRef: DocumentReference<DocumentData>): Promise<{ id: string; data: DocumentData } | null> => {
    try {
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, data: docSnap.data() } : null;
    } catch (error: unknown) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  // Get multiple documents from a query
  getDocs: async (queryRef: Query<DocumentData>): Promise<DocumentData[]> => {
    try {
      const snapshot = await getDocs(queryRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: unknown) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
};