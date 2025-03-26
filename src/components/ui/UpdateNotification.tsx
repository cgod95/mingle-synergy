
import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }
  }, []);
  
  const handleUpdate = () => {
    // Show notification before refreshing
    notificationService.showNotification(
      'App Updated',
      { body: 'Your app has been updated to the latest version.' }
    );
    window.location.reload();
  };
  
  if (!updateAvailable) return null;
  
  return (
    <div className="fixed bottom-16 inset-x-0 mx-auto w-max p-4 bg-[#F3643E] text-white rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <p className="font-medium">Update available!</p>
        <button 
          onClick={handleUpdate}
          className="px-4 py-1 bg-white text-[#F3643E] rounded-full font-medium text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
