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
  const { onboardingProgress, isOnboardingComplete } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Hide bottom nav during onboarding (except demo mode)
  // Only show after profile AND photo are complete
  const shouldShow = config.DEMO_MODE || (
    isOnboardingComplete && 
    onboardingProgress.profile && 
    onboardingProgress.photo
  );

  // Don't render if onboarding not complete
  if (!shouldShow) {
    return null;
  }

  // Get unread count (works for both demo and production)
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    let unsubscribe: (() => void) | undefined;
    let intervalId: NodeJS.Timeout | undefined;
    
    const updateUnreadCount = async () => {
      if (config.DEMO_MODE) {
        // Demo mode: count unread from matchesCompat
        try {
          const { getAllMatches } = await import('@/lib/matchesCompat');
          const matches = await getAllMatches(currentUser.uid);
          const total = matches.reduce((sum, m) => sum + (m.unreadCount || 0), 0);
          setUnreadCount(total);
        } catch (error) {
          // Error fetching demo unread count - non-critical, silently fail
        }
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
        }
      }
    };

    // Initial load
    updateUnreadCount();

    // DISABLED: Polling interval was causing flickering every 2 seconds
    // In demo mode, we only update on mount to prevent constant re-renders
    // if (config.DEMO_MODE) {
    //   intervalId = setInterval(updateUnreadCount, 2000); // Check every 2 seconds
    // }
    
    return () => {
      if (unsubscribe) unsubscribe();
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentUser?.uid]);

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
      className="fixed bottom-0 left-0 right-0 bg-neutral-800/95 backdrop-blur-md border-t border-neutral-700 shadow-lg px-4 py-3 z-50"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
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
