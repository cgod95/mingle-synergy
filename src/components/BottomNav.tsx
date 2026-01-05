import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, User, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import config from '@/config';

// BottomNav: Main navigation bar - dark theme with brand purple
const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { onboardingProgress, isOnboardingComplete, isLoading } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const localStorageComplete = typeof window !== 'undefined' 
    ? localStorage.getItem('onboardingComplete') === 'true' 
    : false;
  const allStepsComplete = onboardingProgress.profile && onboardingProgress.photo;
  const shouldShow = config.DEMO_MODE || localStorageComplete || (
    allStepsComplete && isOnboardingComplete
  );

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    let unsubscribe: (() => void) | undefined;
    
    const updateUnreadCount = async () => {
      if (config.DEMO_MODE) {
        setUnreadCount(0);
      } else {
        try {
          const { subscribeToUnreadCounts } = await import('@/features/messaging/UnreadMessageService');
          unsubscribe = subscribeToUnreadCounts(currentUser.uid, (counts: Record<string, number>) => {
            const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
            setUnreadCount(total);
          });
        } catch (error) {
          setUnreadCount(0);
        }
      }
    };

    updateUnreadCount();

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

  if (isLoading && !config.DEMO_MODE) {
    return null;
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
      className="fixed bottom-0 left-0 right-0 bg-[#111118]/95 backdrop-blur-xl border-t border-[#2D2D3A] px-4 py-3 z-[9999]"
      style={{ 
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
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
              className="relative flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
            >
              <div className={`relative transition-transform duration-200 ${active ? 'text-[#7C3AED] scale-110' : 'text-[#6B7280] hover:text-[#9CA3AF]'}`}>
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                {showBadge && (
                  <div className="absolute -top-1 -right-1 bg-[#7C3AED] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-[#111118]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <span className={`text-xs transition-colors ${active ? 'font-semibold text-[#7C3AED]' : 'font-medium text-[#6B7280]'}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#7C3AED] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
