import React from 'react';
import { motion } from 'framer-motion';
import BottomNav from './BottomNav';
import PageTransition from './ui/PageTransition';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showBottomNav = true,
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <PageTransition mode="fade">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`pb-20 ${showBottomNav ? 'pb-20' : ''}`}
        >
          {children}
        </motion.main>
      </PageTransition>
      
      {showBottomNav && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        >
          <BottomNav />
        </motion.div>
      )}
    </div>
  );
};

export default Layout; 