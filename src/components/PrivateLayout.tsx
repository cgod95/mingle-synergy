import React from 'react';
import { motion } from 'framer-motion';
import BottomNav from './BottomNav';
import PageTransition from './ui/PageTransition';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

const PrivateLayout: React.FC<LayoutProps> = ({ 
  children, 
  showBottomNav = true,
  className = ""
}) => {
  const { currentUser } = useAuth();

  return (
    <div className={`min-h-screen bg-background text-base text-foreground font-sans ${className}`}>
      <PageTransition mode="fade">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`pb-20 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 ${showBottomNav ? 'pb-20' : ''}`}
        >
          {children}
        </motion.main>
      </PageTransition>
      {showBottomNav && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 w-full z-40"
        >
          <BottomNav />
        </motion.div>
      )}
    </div>
  );
};

export default PrivateLayout; 