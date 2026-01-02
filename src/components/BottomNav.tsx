import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, User, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import config from '@/config';

// BottomNav: Main navigation bar for user-facing pages with red notification badges
// Routes match App.tsx: /checkin, /matches, /profile
// Hidden during onboarding (except demo mode) - only shows after profile + photo complete
const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { onboardingProgress, isOnboardingComplete, isLoading } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Compute shouldShow BEFORE any useEffect (React hooks must be called unconditionally)
  const localStorageComplete = typeof window !== 'undefined' 
    ? localStorage.getItem('onboardingComplete') === 'true' 
    : false;
  const allStepsComplete = onboardingProgress.profile && onboardingProgress.photo;
  const shouldShow = config.DEMO_MODE || localStorageComplete || (
    allStepsComplete && isOnboardingComplete
  );

  // Get unread count (works for both demo and production)
  // IMPORTANT: This useEffect must be called unconditionally (before any early returns)
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    let unsubscribe: (() => void) | undefined;
    
    const updateUnreadCount = async () => {
      if (config.DEMO_MODE) {
        // Demo mode: In demo mode, we don't track read status, so show 0
        // This prevents showing incorrect/stale badge numbers
        setUnreadCount(0);
      } else {
        // Production: use Firebase service
        try {
          const { subscribeToUnreadCounts } = await import('@/features/messaging/UnreadMessageService');
          unsubscribe = subscribeToUnreadCounts(currentUser.uid, (counts: Record<string, number>) => {
            const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
            setUnreadCount(total);
          });
        } catch (error) {
          // UnreadMessageService not available - non-critical, silently fail
          setUnreadCount(0);
        }
      }
    };

    // Initial load
    updateUnreadCount();

    // Re-update when window gains focus (user returns to app)
    const handleFocus = () => {
      if (!config.DEMO_MODE) {
        updateUnreadCount();
      }
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUser?.uid]);
  
  // Re-fetch unread count when navigating to matches page
  useEffect(() => {
    if (location.pathname === '/matches' && !config.DEMO_MODE && currentUser?.uid) {
      // Clear badge when viewing matches (as user is reading them)
      // The real-time subscription will update with actual unread count
    }
  }, [location.pathname, currentUser?.uid]);

  // Early returns AFTER all hooks (React requires hooks to be called unconditionally)
  if (isLoading && !config.DEMO_MODE) {
    return null; // Don't show while loading onboarding state
  }

  if (!shouldShow) {
    return null;
  }

  const navItems = [
    { path: '/checkin', icon: MapPin, label: 'Venues' },
    { path: '/matches', icon: Heart, label: 'Matches', showBadge: true },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/checkin') {
      return location.pathname === '/checkin' || location.pathname.startsWith('/venues/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-neutral-800/95 backdrop-blur-md border-t border-neutral-700 shadow-lg px-4 py-3 z-[9999]"
      style={{ 
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        // Force visibility on mobile by using transform to avoid iOS scroll issues
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const showBadge = item.showBadge && unreadCount > 0;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={`Navigate to ${item.label}${showBadge ? ` (${unreadCount} unread)` : ''}`}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <div
                className={`relative ${active ? 'text-indigo-500 scale-110' : 'text-neutral-500'}`}
              >
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                {/* Red notification badge - iOS/Android style */}
                {showBadge && (
                  <div
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg border-2 border-white"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <span
                className={`text-xs ${active ? 'font-bold text-indigo-500' : 'font-medium text-neutral-500'}`}
              >
                {item.label}
              </span>
              {active && (
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
