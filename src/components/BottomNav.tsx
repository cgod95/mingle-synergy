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
      return location.pathname === '/venues' || location.pathname.startsWith('/venue/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/50",
        "shadow-lg shadow-black/5",
        "px-4 py-2"
      )}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path, item.label)}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200",
                "hover:bg-gray-100/80 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2",
                active 
                  ? "text-blue-600 bg-blue-50/80" 
                  : "text-gray-600 hover:text-gray-900"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={item.ariaLabel}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon 
                  size={20} 
                  className={cn(
                    "transition-transform duration-200",
                    active && "scale-110"
                  )}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <motion.span
                animate={{
                  color: active ? '#3B82F6' : '#6B7280',
                  fontWeight: active ? '600' : '400'
                }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "text-xs mt-1 font-medium transition-all duration-200",
                  active ? "text-blue-600" : "text-gray-500"
                )}
              >
                {item.label}
              </motion.span>
              
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
