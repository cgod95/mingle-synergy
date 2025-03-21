
import React, { useEffect, useState } from 'react';
import { firestore } from '../services/firebase';
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

const TestBackend = () => {
  const [status, setStatus] = useState('Initializing...');
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Add a test result
  const addResult = (message: string) => {
    console.log(message);
    setResults(prev => [...prev, message]);
  };

  // Test basic Firebase connectivity
  const testFirebaseConnection = async () => {
    try {
      setStatus('Testing Firebase connection...');
      addResult('Attempting to connect to Firebase...');
      
      // Test Firestore
      const testDocRef = doc(firestore, 'test', 'test');
      const testDoc = await getDoc(testDocRef);
      addResult(`Firestore connection successful: ${testDoc.exists() ? 'Document exists' : 'Document does not exist'}`);
      
      // Create a test document
      await setDoc(testDocRef, {
        timestamp: serverTimestamp()
      });
      addResult('Successfully wrote to Firestore');
      
      setStatus('Firebase connection test completed');
    } catch (err) {
      console.error('Firebase connection error:', err);
      setError(`Firebase error: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('Test failed');
    }
  };

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="font-medium">Status: {status}</div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
      
      <div className="space-y-2">
        {results.map((result, index) => (
          <div key={index} className="p-3 bg-blue-50 rounded-lg">
            {result}
          </div>
        ))}
      </div>
      
      <button 
        onClick={testFirebaseConnection}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Run Test Again
      </button>
    </div>
  );
};

export default TestBackend;
