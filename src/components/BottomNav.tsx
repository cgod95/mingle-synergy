import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, Users, User, Bell, RefreshCw, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { hasReconnectRequests } from '@/services/reconnectRequestsService';
import { subscribeToUnreadCounts, getTotalUnreadCount, UnreadCounts } from '@/features/messaging/UnreadMessageService';

const BottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const [hasRequests, setHasRequests] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    const checkRequests = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const hasPendingRequests = await hasReconnectRequests(currentUser.uid);
        setHasRequests(hasPendingRequests);
      } catch (error) {
        console.error('Error checking reconnect requests:', error);
      }
    };

    checkRequests();
    
    // Check every 30 seconds for new requests
    const interval = setInterval(checkRequests, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow z-50">
      <ul className="flex justify-around items-center h-14">
        <li>
          <NavLink
            to="/venues"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-500'
            }
          >
            <Home className="w-6 h-6" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/liked-users"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-500'
            }
          >
            <Heart className="w-6 h-6" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/matches"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-500'
            }
          >
            <Users className="w-6 h-6" />
          </NavLink>
        </li>
        <li className="relative">
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-500'
            }
          >
            <MessageCircle className="w-6 h-6" />
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </NavLink>
        </li>
        <li className="relative">
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-500'
            }
          >
            <Bell className="w-6 h-6" />
            {hasRequests && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/reconnects"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-500'
            }
          >
            <RefreshCw className="w-6 h-6" />
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-gray-500'
            }
          >
            <User className="w-6 h-6" />
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;
