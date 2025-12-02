import React from 'react';
import BottomNav from './BottomNav';

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
      {/* Remove PageTransition and motion animations to prevent flickering */}
      <main className={`pb-20 ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && (
        <BottomNav />
      )}
    </div>
  );
};

export default Layout; 