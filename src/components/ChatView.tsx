import { useEffect, useRef, useState } from 'react';
import { Match, User, Message } from '@/types';
import MessageInput from './MessageInput';
import ExpiredMatchNotice from './ExpiredMatchNotice';
import MessageLimitNotice from './Notices/MessageLimitNotice';
import ReconnectionPrompt from './ReconnectionPrompt';
import { mockUsers } from '@/data/mock';
import { mockMessages } from '@/data/mock';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, User as UserIcon } from 'lucide-react';

interface ChatViewProps {
  match: Match;
  currentUserId: string;
  onNewMessage?: (text: string) => void;
}

export default function ChatView({ match, currentUserId, onNewMessage }: ChatViewProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [messageLimitReached, setMessageLimitReached] = useState(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for explicit matchExpired flag first
    if (match?.isActive === false) {
      setIsExpired(true);
    } else {
      // Fallback to timestamp calculation
      const now = Date.now();
      const expiresAt = match.timestamp + 3 * 60 * 60 * 1000;
      setIsExpired(now > expiresAt);
    }

    // Get messages for this match
    const matchMessages = mockMessages.filter(msg => msg.matchId === match.id);
    setMessages(matchMessages);
    
    const sentMessages = matchMessages.filter(m => m.senderId === currentUserId).length;
    setMessageLimitReached(sentMessages >= 3);
  }, [match, currentUserId]);

  useEffect(() => {
    // Fetch the other user's profile
    const fetchOtherUser = () => {
      const otherUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
      const otherUserProfile = mockUsers.find(u => u.id === otherUserId);
      setOtherUser(otherUserProfile || null);
    };

    fetchOtherUser();
  }, [match, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Chat Header */}
      <div className="flex items-center space-x-4 p-4 bg-white border-b shadow-sm">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Avatar className="h-12 w-12 border-2 border-pink-200">
            <AvatarImage src={otherUser?.photoURL} alt={otherUser?.name} />
            <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-lg font-semibold">
              {otherUser?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">{otherUser?.name || 'Match'}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span>Active now</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isExpired && otherUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <ExpiredMatchNotice name={otherUser.name || 'your match'} />
          </motion.div>
        )}

        {messages.length === 0 && !isExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start the conversation!</h3>
            <p className="text-gray-600">Send a message to {otherUser?.name || 'your match'} to get things started.</p>
          </motion.div>
        )}

        {messages.map((msg, index) => {
          const isOwnMessage = msg.senderId === currentUserId;
          const showAvatar = !isOwnMessage;
          const showTime = index === messages.length - 1 || 
            messages[index + 1]?.senderId !== msg.senderId;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              {showAvatar && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={otherUser?.photoURL} alt={otherUser?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-sm">
                    {otherUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {/* Message Bubble */}
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                
                {/* Time Stamp */}
                {showTime && (
                  <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>
                )}
              </div>
              
              {/* Spacer for own messages */}
              {isOwnMessage && <div className="w-8" />}
            </motion.div>
          );
        })}
        
        <div ref={bottomRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 bg-white border-t">
        {isExpired ? (
          <ReconnectionPrompt name={otherUser?.name || 'your match'} />
        ) : messageLimitReached ? (
          <MessageLimitNotice />
        ) : (
          <MessageInput
            matchId={match.id}
            onMessageSent={() => {
              // Refresh messages
              const updatedMessages = mockMessages.filter(msg => msg.matchId === match.id);
              setMessages(updatedMessages);
            }}
          />
        )}
      </div>
    </div>
  );
} 