
// Simple fetch wrapper for data fetching
export const fetcher = async (url: string, options?: RequestInit): Promise<any> => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return response.json();
};

// For Firebase-specific operations
export const firebaseFetcher = {
  // Get a document by reference
  getDoc: async (docRef: any): Promise<any> => {
    try {
      const doc = await docRef.get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },
  
  // Get documents from a collection with query
  getDocs: async (query: any): Promise<any[]> => {
    try {
      const snapshot = await query.get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
  
  // Update a document
  updateDoc: async (docRef: any, data: any): Promise<void> => {
    try {
      await docRef.update(data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
};
