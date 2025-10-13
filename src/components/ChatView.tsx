import { useEffect, useRef, useState } from 'react';
import { Match, User, Message } from '@/types';
import MessageInput from './MessageInput';
import ExpiredMatchNotice from './ExpiredMatchNotice';
import MessageLimitNotice from './Notices/MessageLimitNotice';
import ReconnectionPrompt from './ReconnectionPrompt';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, User as UserIcon } from 'lucide-react';
import userService from '@/services/firebase/userService';
import { UserProfile } from '@/types/services';

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
  const [loading, setLoading] = useState(true);
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

    // Messages are now handled by the parent component
    setMessages([]);
    setLoading(false);
  }, [match, currentUserId]);

  useEffect(() => {
    // Fetch the other user's profile from Firebase
    const fetchOtherUser = async () => {
      try {
        const otherUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
        const otherUserProfile = await userService.getUserProfile(otherUserId);
        
        if (otherUserProfile) {
          // Convert UserProfile to User format
          const adaptedUser: User = {
            id: otherUserProfile.id,
            name: otherUserProfile.name,
            photos: otherUserProfile.photos || [],
            bio: otherUserProfile.bio || '',
            isCheckedIn: otherUserProfile.isCheckedIn,
            currentVenue: otherUserProfile.currentVenue || '',
            isVisible: otherUserProfile.isVisible,
            interests: otherUserProfile.interests || [],
            gender: otherUserProfile.gender,
            interestedIn: otherUserProfile.interestedIn || [],
            age: otherUserProfile.age,
            ageRangePreference: otherUserProfile.ageRangePreference,
          };
          setOtherUser(adaptedUser);
        }
      } catch (error) {
        console.error('Error fetching other user:', error);
      }
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

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Chat Header */}
      <div className="flex items-center space-x-4 p-4 bg-white border-b shadow-sm">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Avatar className="h-12 w-12 border-2 border-pink-200">
            <AvatarImage src={otherUser?.photos?.[0]} alt={otherUser?.name} />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="text-gray-500 mb-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Start a conversation!</p>
            </div>
          </motion.div>
        )}

        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      {!isExpired && (
        <div className="p-4 border-t bg-white">
          {messageLimitReached ? (
            <MessageLimitNotice />
          ) : (
            <MessageInput matchId={match.id} onMessageSent={() => onNewMessage?.('')} />
          )}
        </div>
      )}

      {/* Reconnection Prompt for Expired Matches */}
      {isExpired && otherUser && (
        <div className="p-4 border-t bg-white">
          <ReconnectionPrompt name={otherUser.name || 'your match'} />
        </div>
      )}
    </div>
  );
} 