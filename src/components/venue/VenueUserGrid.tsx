import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MapPin, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/services/analytics';
import { usePerformanceMonitoring } from '@/services/performanceMonitoring';

interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  lastActive: string;
  distance: number;
  isOnline: boolean;
  isVerified: boolean;
  isPremium: boolean;
}

interface VenueUserGridProps {
  users: User[];
  venueName: string;
  onUserLike: (userId: string) => void;
  onUserMessage: (userId: string) => void;
  onUserView: (userId: string) => void;
  className?: string;
}

const VenueUserGrid: React.FC<VenueUserGridProps> = ({
  users,
  venueName,
  onUserLike,
  onUserMessage,
  onUserView,
  className
}) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { recordMetric } = usePerformanceMonitoring();

  useEffect(() => {
    recordMetric('venue_user_grid_loaded', { userCount: users.length });
    analytics.track('venue_users_viewed', { 
      venue: venueName, 
      userCount: users.length 
    });
  }, [users, venueName, recordMetric]);

  const handleLike = (userId: string) => {
    setLikedUsers(prev => new Set([...prev, userId]));
    onUserLike(userId);
    
    analytics.track('user_liked', { 
      venue: venueName, 
      userId,
      source: 'venue_grid'
    });
  };

  const handleMessage = (userId: string) => {
    onUserMessage(userId);
    analytics.track('message_initiated', { 
      venue: venueName, 
      userId,
      source: 'venue_grid'
    });
  };

  const handleUserClick = (userId: string) => {
    setSelectedUser(selectedUser === userId ? null : userId);
    onUserView(userId);
  };

  const formatLastActive = (lastActive: string) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  if (!users.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex flex-col items-center justify-center py-12 text-center",
          className
        )}
      >
        <Users className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No users at this venue yet
        </h3>
        <p className="text-gray-500 max-w-md">
          Be the first to check in and start connecting with people at {venueName}!
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {users.length} people at {venueName}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'grid' 
                ? "bg-blue-100 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            )}
            aria-label="Grid view"
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
            </div>
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'list' 
                ? "bg-blue-100 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            )}
            aria-label="List view"
          >
            <div className="w-4 h-4 space-y-0.5">
              <div className="w-full h-1 bg-current rounded-sm" />
              <div className="w-full h-1 bg-current rounded-sm" />
              <div className="w-full h-1 bg-current rounded-sm" />
            </div>
          </button>
        </div>
      </div>

      {/* User Grid/List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" 
            : "space-y-3"
        )}
      >
        <AnimatePresence>
          {users.map((user) => (
            <motion.div
              key={user.id}
              variants={cardVariants}
              whileHover="hover"
              layout
              className={cn(
                "group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",
                "transition-all duration-200 cursor-pointer",
                "hover:shadow-lg hover:border-gray-200",
                viewMode === 'list' && "flex items-center space-x-4 p-4"
              )}
              onClick={() => handleUserClick(user.id)}
            >
              {/* User Image */}
              <div className={cn(
                "relative overflow-hidden",
                viewMode === 'grid' ? "aspect-square" : "w-16 h-16 rounded-full"
              )}>
                <img
                  src={user.photos[0] || '/placeholder.svg'}
                  alt={`${user.name}'s photo`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Online indicator */}
                {user.isOnline && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
                
                {/* Premium badge */}
                {user.isPremium && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ★
                  </div>
                )}
                
                {/* Verified badge */}
                {user.isVerified && (
                  <div className="absolute bottom-2 left-2 bg-blue-500 text-white p-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className={cn(
                "p-4",
                viewMode === 'list' && "flex-1"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.name}, {user.age}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {user.distance}km
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {user.bio}
                </p>
                
                {/* Interests */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.interests.slice(0, 3).map((interest, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                  {user.interests.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{user.interests.length - 3} more
                    </span>
                  )}
                </div>
                
                {/* Last active */}
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatLastActive(user.lastActive)}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(user.id);
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-red-500/20",
                      likedUsers.has(user.id)
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    )}
                  >
                    <Heart className={cn(
                      "w-4 h-4 mr-1 transition-all duration-200",
                      likedUsers.has(user.id) && "fill-current"
                    )} />
                    {likedUsers.has(user.id) ? 'Liked' : 'Like'}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessage(user.id);
                    }}
                    className="flex-1 flex items-center justify-center py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VenueUserGrid; 