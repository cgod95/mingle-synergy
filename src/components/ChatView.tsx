import { useEffect, useRef, useState } from 'react';
import { FirestoreMatch } from '@/types/match';
import MessageInput from './MessageInput';
import ExpiredMatchNotice from './ExpiredMatchNotice';
import MessageLimitNotice from './Notices/MessageLimitNotice';
import ReconnectionPrompt from './ReconnectionPrompt';
import userService from '@/services/firebase/userService';
import { UserProfile } from '@/types/UserProfile';

interface ChatViewProps {
  match: FirestoreMatch;
  currentUserId: string;
  onNewMessage?: (text: string) => void;
}

export default function ChatView({ match, currentUserId, onNewMessage }: ChatViewProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [messageLimitReached, setMessageLimitReached] = useState(false);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for explicit matchExpired flag first
    if (match?.matchExpired) {
      setIsExpired(true);
    } else {
      // Fallback to timestamp calculation
      const now = Date.now();
      const expiresAt = match.timestamp + 3 * 60 * 60 * 1000;
      setIsExpired(now > expiresAt);
    }

    const sentMessages = match.messages.filter(m => m.senderId === currentUserId).length;
    setMessageLimitReached(sentMessages >= 3);
  }, [match, currentUserId]);

  useEffect(() => {
    // Fetch the other user's profile
    const fetchOtherUser = async () => {
      const otherUserId = match.userId1 === currentUserId ? match.userId2 : match.userId1;
      try {
        const userProfile = await userService.getUserProfile(otherUserId);
        setOtherUser(userProfile);
      } catch (error) {
        console.error('Error fetching other user profile:', error);
      }
    };

    fetchOtherUser();
  }, [match, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [match.messages.length]);

  return (
    <div className="flex flex-col h-full border rounded-lg p-4 bg-white shadow-sm">
      {isExpired && otherUser && (
        <ExpiredMatchNotice name={otherUser.name || 'your match'} />
      )}

      <div className="flex-grow overflow-y-auto space-y-2 mb-4">
        {match.messages.map((msg, index) => (
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
          onSend={(text) => {
            onNewMessage?.(text);
          }}
        />
      )}
    </div>
  );
} 