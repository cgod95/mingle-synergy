
import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }
  }, []);
  
  useEffect(() => {
    // Auto-dismiss notification after 5 seconds
    if (updateAvailable) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setUpdateAvailable(false);
        }, 300);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [updateAvailable]);
  
  const handleUpdate = () => {
    // Show notification before refreshing
    notificationService.showNotification(
      'App Updated',
      { body: 'Your app has been updated to the latest version.' }
    );
    // Reload page to apply service worker updates
    window.location.reload();
  };
  
  if (!updateAvailable) return null;
  
  return (
    <div className={`fixed bottom-16 inset-x-0 mx-auto w-max p-4 bg-indigo-600 text-white rounded-lg shadow-lg z-50 ${
      isExiting ? 'opacity-0 transition-opacity duration-300' : 'opacity-100'
    }`}>
      <div className="flex items-center space-x-3">
        <p className="font-medium">Update available!</p>
        <button 
          onClick={handleUpdate}
          className="px-4 py-1 bg-white text-indigo-600 rounded-full font-medium text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
