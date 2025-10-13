import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, Users, User, MessageCircle, MapPin, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToUnreadCounts, getTotalUnreadCount, UnreadCounts } from '@/features/messaging/UnreadMessageService';
import { motion } from 'framer-motion';
import { analytics } from '@/services/analytics';
import { usePerformanceMonitoring } from '@/services/performanceMonitoring';
import { cn } from '@/lib/utils';

// BottomNav: Main navigation bar for user-facing pages
// Only includes Venues, Likes, Matches, Messages, Profile
const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { recordMetric } = usePerformanceMonitoring();

  // Subscribe to unread message counts
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToUnreadCounts(currentUser.uid, (counts) => {
      setUnreadCounts(counts);
      const total = getTotalUnreadCount(counts);
      setHasUnreadMessages(total > 0);
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleNavigation = (path: string, label: string) => {
    const startTime = performance.now();
    
    // Track navigation analytics
    analytics.track('bottom_nav_clicked', {
      from: location.pathname,
      to: path,
      label,
      timestamp: Date.now()
    });

    navigate(path);
    
    // Record navigation performance
    recordMetric({
      name: 'navigation_time',
      value: performance.now() - startTime,
      unit: 'ms',
      category: 'interaction'
    });
  };

  const navItems = [
    {
      path: '/venues',
      icon: MapPin,
      label: 'Venues',
      ariaLabel: 'Browse venues'
    },
    {
      path: '/matches',
      icon: Heart,
      label: 'Matches',
      ariaLabel: 'View your matches',
      badge: 3 // Example badge count
    },
    {
      path: '/messages',
      icon: MessageCircle,
      label: 'Messages',
      ariaLabel: 'Open chat messages',
      badge: hasUnreadMessages ? getTotalUnreadCount(unreadCounts) : undefined
    },
    {
      path: '/liked-users',
      icon: Users,
      label: 'Likes',
      ariaLabel: 'View liked users'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      ariaLabel: 'View your profile'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/venues') {
      return location.pathname === '/venues' || location.pathname.startsWith('/venues/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50"
    >
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path, item.label)}
                className={cn(
                  "relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1",
                  active 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={item.ariaLabel}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors duration-200",
                      active ? "text-blue-600" : "text-gray-500"
                    )} 
                  />
                  {item.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.div>
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs font-medium mt-1 transition-colors duration-200 truncate",
                    active ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNav;
