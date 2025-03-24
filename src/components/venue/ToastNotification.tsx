
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AnimatePresence>
      <motion.div 
        className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#3A86FF] text-white px-4 py-2 rounded-full shadow-lg z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
};

export default ToastNotification;
