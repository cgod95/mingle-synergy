import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';
import { Message } from '@/types';

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
  userName,
  userPhoto,
  lastMessage,
  isOnline,
  venue,
  unreadCount,
  onSelect,
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors duration-200"
        onClick={() => onSelect(matchId)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={userPhoto} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              {isOnline && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                />
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm truncate">{userName}</h3>
                <div className="flex items-center space-x-2">
                  {venue && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-20">{venue.name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{lastMessage.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {lastMessage.content}
                </p>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChatPreview; 