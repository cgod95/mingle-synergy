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
    <div className={`min-h-screen min-h-[100dvh] bg-neutral-900 ${className}`}>
      {/* Main content with safe area padding */}
      <main 
        className={`${showBottomNav ? 'pb-nav-safe' : 'safe-bottom'}`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {children}
      </main>
      
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
