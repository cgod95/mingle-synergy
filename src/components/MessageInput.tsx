// 🧠 Purpose
// Create MessageInput component that allows sending messages in an active match chat.
// This is a core user-facing feature for the MVP chat experience.

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { mockMessages } from '@/data/mock';
import { Message } from '@/types';
import { logUserAction } from '@/utils/errorHandler';

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

    // Simulate real-time updates for message limits
    const interval = setInterval(() => {
      const userMessages = mockMessages.filter(
        msg => msg.matchId === matchId && msg.senderId === currentUser.uid
      );
      const messageLimit = 5; // Use feature flag in production
      const remaining = Math.max(0, messageLimit - userMessages.length);
      const canSendMessages = remaining > 0;
      
      setCanSend(canSendMessages);
      setRemainingMessages(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [matchId, currentUser?.uid]);

  const handleSend = async () => {
    if (!text.trim() || !currentUser || !canSend) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create new message
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        matchId,
        senderId: currentUser.uid,
        receiverId: '', // Will be set by the parent component
        text: text.trim(),
        content: text.trim(), // Add content property for compatibility
        timestamp: Date.now()
      };

      // In a real app, this would be saved to the backend
      // For now, we'll just simulate the success
      logUserAction('message_sent', { matchId, messageLength: text.trim().length });
      
      setText('');
      onMessageSent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
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
          disabled={loading || !canSend}
          maxLength={500}
        />
        <Button 
          onClick={handleSend} 
          disabled={isDisabled}
          className="px-4 py-2 text-sm"
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>

      {/* Character count */}
      <div className="text-xs text-gray-400 text-right">
        {text.length}/500
      </div>
    </div>
  );
} 