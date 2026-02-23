import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, User, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import config from '@/config';
import { hapticLight } from '@/lib/haptics';

const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { onboardingProgress, isOnboardingComplete, isLoading } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const lastNavTime = useRef(0);

  // Debounced navigation to prevent double-taps
  const handleNavigate = useCallback((path: string) => {
    const now = Date.now();
    if (now - lastNavTime.current < 300) return; // 300ms debounce
    lastNavTime.current = now;
    hapticLight();
    navigate(path);
  }, [navigate]);

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
    { path: '/checkin', icon: MapPin, label: 'Venues', activeColor: 'text-violet-400' },
    { path: '/matches', icon: Heart, label: 'Matches', showBadge: true, activeColor: 'text-rose-400' },
    { path: '/profile', icon: User, label: 'Profile', activeColor: 'text-violet-400' },
  ];

  const isActive = (path: string) => {
    if (path === '/checkin') {
      return location.pathname === '/checkin' || location.pathname.startsWith('/venues/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 nav-blur-ios shadow-2xl z-50 hide-on-keyboard"
      style={{ 
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto px-2 pt-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const showBadge = item.showBadge && unreadCount > 0;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              aria-label={`Navigate to ${item.label}${showBadge ? ` (${unreadCount} unread)` : ''}`}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center py-1.5 px-4 min-w-[64px] min-h-[48px] rounded-xl transition-all duration-200 active:scale-95 touch-target"
            >
              <div className={`relative ${active ? (item.activeColor || 'text-violet-400') : 'text-neutral-400'}`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {showBadge && (
                  <div role="status" aria-live="polite" className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 shadow-lg border-2 border-neutral-800">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${active ? `font-semibold ${item.activeColor || 'text-violet-400'}` : 'font-medium text-neutral-400'}`}>
                {item.label}
              </span>
              {active && (
                <div className={`absolute bottom-0.5 w-5 h-0.5 rounded-full ${item.path === '/matches' ? 'bg-rose-500' : 'bg-violet-500'}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
