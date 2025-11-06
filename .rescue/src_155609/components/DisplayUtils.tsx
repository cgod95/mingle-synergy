import React from 'react';

export const SuccessAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
    <strong className="font-bold">Success:</strong>
    <span className="block sm:inline ml-2">{message}</span>
  </div>
);

export const SimpleEmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="text-center py-12 text-gray-500">
    <p className="text-xl font-semibold">{title}</p>
    {description && <p className="mt-2 text-sm">{description}</p>}
  </div>
);

export const SimpleSectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
); 