// 🧠 Purpose
// Create MessageInput component that allows sending messages in an active match chat.
// This is a core user-facing feature for the MVP chat experience.

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Message } from '@/types';
import logger from '@/utils/Logger';
import { sendMessage, getRemainingMessages } from '@/services/messageService';

interface MessageInputProps {
  matchId: string;
  onMessageSent: () => void;
}

export default function MessageInput({ matchId, onMessageSent }: MessageInputProps) {
  const { currentUser } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingMessages, setRemainingMessages] = useState<number>(3);
  const [canSend, setCanSend] = useState(true);

  // Subscribe to message limit updates
  useEffect(() => {
    if (!currentUser?.uid || !matchId) return;

    // Check message limit via messageService util
    const checkMessageLimit = async () => {
      try {
        const remaining = await getRemainingMessages(matchId, currentUser.uid);
        setRemainingMessages(remaining);
        setCanSend(remaining > 0);
      } catch (err) {
        logger.error('Error checking message limit:', err);
      }
    };

    checkMessageLimit();
    
    // Check periodically for updates
    const interval = setInterval(checkMessageLimit, 5000);
    return () => clearInterval(interval);
  }, [matchId, currentUser?.uid]);

  const handleSend = async () => {
    if (!text.trim() || !currentUser || !canSend) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Send message using Firebase service
      await sendMessage(matchId, currentUser.uid, text.trim());
      
      setText('');
      onMessageSent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      logger.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = loading || !text.trim() || !canSend || !currentUser;

  return (
    <div className="flex flex-col gap-2 p-4 bg-white border-t">
      {/* Message limit indicator */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {canSend ? `${remainingMessages} messages remaining` : 'Message limit reached'}
        </span>
        {error && <span className="text-red-500">{error}</span>}
      </div>

      {/* Input and send button */}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          placeholder={canSend ? "Type your message..." : "Message limit reached"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!canSend || loading}
        />
        <Button
          onClick={handleSend}
          disabled={isDisabled}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
} 