import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, Users, User, MessageCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToUnreadCounts, getTotalUnreadCount, UnreadCounts } from '@/features/messaging/UnreadMessageService';
import { motion } from 'framer-motion';

// BottomNav: Main navigation bar for user-facing pages
// Only includes Venues, Likes, Matches, Messages, Profile
const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/matches', icon: Heart, label: 'Matches' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/venues', icon: MapPin, label: 'Venues' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
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
