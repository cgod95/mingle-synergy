import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, MapPin, Clock, Circle } from 'lucide-react';
import { Message } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { mockMessages } from '@/data/mock';

interface MatchData {
  id: string;
  displayName: string;
}

interface ChatPreviewProps {
  matchId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  lastMessage: Message;
  isOnline: boolean;
  venue?: { name: string };
  unreadCount: number;
  onSelect: (matchId: string) => void;
  index?: number;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({
  matchId,
  userId,
  userName,
  userPhoto,
  lastMessage,
  isOnline,
  venue,
  unreadCount,
  onSelect,
  index = 0
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-white to-gray-50"
        onClick={() => onSelect(matchId)}
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            {/* Large Profile Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative flex-shrink-0"
            >
              <Avatar className="h-16 w-16 border-2 border-pink-200 shadow-md">
                <AvatarImage src={userPhoto} alt={userName} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-lg font-semibold">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* Online Status */}
              {isOnline && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-3 border-white shadow-lg"
                />
              )}
              
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge className="bg-pink-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-800 truncate">{userName}</h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(lastMessage.timestamp)}</span>
                </div>
              </div>

              {/* Venue Info */}
              {venue && (
                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{venue.name}</span>
                </div>
              )}

              {/* Last Message */}
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 truncate font-medium">
                    {lastMessage.content}
                  </p>
                </div>
                
                {/* Message Status Indicator */}
                <div className="flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChatPreview; 