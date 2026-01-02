import { useEffect, useRef, useState } from 'react';
import { Match, User, Message } from '@/types';
import MessageInput from './MessageInput';
import ExpiredMatchNotice from './ExpiredMatchNotice';
import MessageLimitNotice from './Notices/MessageLimitNotice';
import ReconnectionPrompt from './ReconnectionPrompt';
import { mockUsers } from '@/data/mock';
import { mockMessages } from '@/data/mock';
import { FEATURE_FLAGS } from '@/lib/flags';

// Get message limit from feature flags (default: 10)
const MESSAGE_LIMIT = typeof FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER === 'number' && FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER > 0
  ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER
  : 10;

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
    setMessageLimitReached(sentMessages >= MESSAGE_LIMIT);
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

  return (
    <div className="flex flex-col h-full border rounded-lg p-4 bg-white shadow-sm">
      {isExpired && otherUser && (
        <ExpiredMatchNotice name={otherUser.name || 'your match'} />
      )}

      <div className="flex-grow overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.senderId === currentUserId
                ? 'ml-auto bg-blue-500 text-white'
                : 'mr-auto bg-gray-200 text-gray-800'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

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
  );
} 