import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full p-8">
    <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  </div>
);

export const PageError: React.FC<{ error?: string }> = ({ error }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-12">
    <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
    <p className="text-sm text-gray-700 mb-4">{error || 'An unexpected error occurred. Please try again.'}</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Reload Page
    </button>
  </div>
); 