import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, User, MessageCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

// BottomNav: Main navigation bar for user-facing pages
// Routes match App.tsx: /checkin, /matches, /chats, /profile
const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Optional: Subscribe to unread message counts (graceful fallback if service unavailable)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Try to subscribe to unread counts, but don't fail if service unavailable
    import('@/features/messaging/UnreadMessageService')
      .then((module) => {
        if (module?.subscribeToUnreadCounts) {
          return module.subscribeToUnreadCounts(
            currentUser.uid,
            (counts: Record<string, number>) => {
              const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
              setHasUnreadMessages(total > 0);
            }
          );
        }
      })
      .catch(() => {
        // Service not available, continue without unread counts
        console.debug('UnreadMessageService not available, continuing without unread counts');
      });
  }, [currentUser?.uid]);

  const navItems = [
    { path: '/checkin', icon: MapPin, label: 'Check In' },
    { path: '/matches', icon: Heart, label: 'Matches' },
    { path: '/chats', icon: MessageCircle, label: 'Chats' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/checkin') {
      return location.pathname === '/checkin' || location.pathname.startsWith('/venues/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 z-50"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  color: active ? '#3B82F6' : '#6B7280',
                  scale: active ? 1.1 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={20} />
              </motion.div>
              <motion.span
                animate={{
                  color: active ? '#3B82F6' : '#6B7280',
                  fontWeight: active ? '600' : '400'
                }}
                transition={{ duration: 0.2 }}
                className="text-xs"
              >
                {item.label}
              </motion.span>
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-1 h-1 bg-blue-500 rounded-full"
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
