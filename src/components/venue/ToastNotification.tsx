
import React, { useEffect } from 'react';

interface ToastNotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ 
  message, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#3A86FF] text-white px-4 py-2 rounded-full shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
};

export default ToastNotification;
