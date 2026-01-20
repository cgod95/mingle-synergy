import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, User, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import config from '@/config';

const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { onboardingProgress, isOnboardingComplete, isLoading } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Always show bottom nav if explicitly requested or after onboarding
  const localStorageComplete = localStorage.getItem('onboardingComplete') === 'true';
  const allStepsComplete = onboardingProgress.profile && onboardingProgress.photo;
  
  // Show immediately if onboarding complete, don't wait for loading
  const shouldShow = config.DEMO_MODE || localStorageComplete || (
    allStepsComplete && isOnboardingComplete
  );

  // Get unread count
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    let unsubscribe: (() => void) | undefined;
    
    const updateUnreadCount = async () => {
      if (config.DEMO_MODE) {
        try {
          const { getAllMatches } = await import('@/lib/matchesCompat');
          const matches = await getAllMatches(currentUser.uid);
          const total = matches.reduce((sum, m) => sum + (m.unreadCount || 0), 0);
          setUnreadCount(total);
        } catch (error) {
          // Non-critical
        }
      } else {
        try {
          const { subscribeToUnreadCounts } = await import('@/features/messaging/UnreadMessageService');
          unsubscribe = subscribeToUnreadCounts(currentUser.uid, (counts: Record<string, number>) => {
            const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
            setUnreadCount(total);
          });
        } catch (error) {
          // Non-critical
        }
      }
    };

    updateUnreadCount();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);

  // Don't render if onboarding not complete (but don't hide while loading)
  if (!shouldShow && !isLoading) {
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
      className="fixed bottom-0 left-0 right-0 bg-neutral-800/98 backdrop-blur-xl border-t border-neutral-700/50 shadow-2xl z-50"
      style={{ 
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto px-2 pt-2">
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
              className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[72px] min-h-[56px] rounded-xl transition-all duration-200 active:scale-95 touch-target"
            >
              <div className={`relative ${active ? 'text-indigo-400' : 'text-neutral-400'}`}>
                <Icon size={26} strokeWidth={active ? 2.5 : 2} />
                {showBadge && (
                  <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-neutral-800">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${active ? 'font-semibold text-indigo-400' : 'font-medium text-neutral-500'}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-6 h-1 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
