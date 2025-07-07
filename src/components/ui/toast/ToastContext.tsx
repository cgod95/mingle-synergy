import React, { useState, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from './toast-context';

// Define ToastType and Toast locally for use in this file
export type ToastType = 'success' | 'error' | 'info';
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      hideToast(id);
    }, 3000);
  }, [hideToast]);

  // Add toast to window for global access
  React.useEffect(() => {
    window.showToast = (message: string) => {
      showToast(message);
    };
    return () => {
      delete window.showToast;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div 
              key={toast.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`px-4 py-2 rounded-full shadow-lg text-white pointer-events-auto ${
                toast.type === 'success' ? 'bg-green-500' : 
                toast.type === 'error' ? 'bg-red-500' : 
                'bg-[#3A86FF]'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
