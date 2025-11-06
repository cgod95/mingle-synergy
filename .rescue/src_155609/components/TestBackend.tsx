
import React from 'react';
import { Link } from 'react-router-dom';

const TestBackend = () => {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Development Environment</h1>
      
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-400 mb-4">
        <p className="font-medium">Mock Services Active</p>
        <p className="text-sm">Using mock data for development. Firebase integration will be completed in production environment.</p>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg">
        <h2 className="font-medium mb-2">Mock Data Status:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Users: 12 mock profiles</li>
          <li>Venues: 8 Sydney locations</li>
          <li>Matches: Generated dynamically</li>
        </ul>
      </div>
      
      <p className="mt-6 text-gray-700">
        Continue development using mock services. All UI components and interactions 
        will function with the mock data providers.
      </p>
      
      <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg">
        Return to Main App
      </Link>
    </div>
  );
};

export default TestBackend;
