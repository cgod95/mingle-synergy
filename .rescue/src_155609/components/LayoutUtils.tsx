import React from 'react';

export const CenteredContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center min-h-[60vh] p-4">
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6 text-center">
    <h1 className="text-2xl font-bold">{title}</h1>
    {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
  </div>
);

export const SimpleEmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center text-gray-500 py-8">
    <p>{message}</p>
  </div>
); 