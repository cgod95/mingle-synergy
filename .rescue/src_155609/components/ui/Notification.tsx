
import React, { useState, useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
  duration?: number; // in milliseconds
}

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  onClose,
  duration = 5000 // default 5 seconds
}) => {
  const [isExiting, setIsExiting] = useState(false);
  
  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      
      // Wait for animation to complete before removing from DOM
      const animationTimer = setTimeout(() => {
        onClose();
      }, 300);
      
      return () => clearTimeout(animationTimer);
    }, duration);
    
    // Cleanup timers on unmount
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  // Handle manual close
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Set styles based on notification type
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-500';
      case 'error': return 'bg-red-100 border-red-500';
      case 'warning': return 'bg-yellow-100 border-yellow-500';
      case 'info': 
      default: return 'bg-blue-100 border-blue-500';
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'success': return 'text-green-700';
      case 'error': return 'text-red-700';
      case 'warning': return 'text-yellow-700';
      case 'info': 
      default: return 'text-blue-700';
    }
  };
  
  return (
    <div 
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 max-w-md w-full p-4 
        rounded-lg shadow-md border-l-4 z-50 transition-all duration-300
        ${getBgColor()} 
        ${isExiting ? 'opacity-0 translate-y-[-20px]' : 'opacity-100'}
      `}
      role="alert"
    >
      <div className="flex justify-between items-center">
        <div className={`font-medium ${getTextColor()}`}>
          {message}
        </div>
        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;
