
import React, { useState, useEffect } from 'react';

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
    window.location.reload();
  };
  
  if (!updateAvailable) return null;
  
  return (
    <div className="fixed bottom-16 inset-x-0 mx-auto w-max p-4 bg-blue-500 text-white rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <p className="font-medium">Update available!</p>
        <button 
          onClick={handleUpdate}
          className="px-4 py-1 bg-white text-blue-500 rounded-full font-medium text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
