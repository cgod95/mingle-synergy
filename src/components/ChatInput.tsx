import { useState, useEffect } from 'react';
import { sendMessage, subscribeToMessageLimit } from '@/services/messageService';

interface ChatInputProps {
  matchId: string;
  userId: string;
  onSend?: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ matchId, userId, onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [canSend, setCanSend] = useState(true);
  const [remainingMessages, setRemainingMessages] = useState(3);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up real-time listener for message limit
    const unsubscribe = subscribeToMessageLimit(matchId, userId, (canSendMessages, remaining) => {
      setCanSend(canSendMessages);
      setRemainingMessages(remaining);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [matchId, userId]);

  const handleSend = async () => {
    if (!message.trim() || !canSend || disabled) return;

    try {
      await sendMessage(matchId, userId, message.trim());
      onSend?.(message.trim());
      setMessage('');
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInputDisabled = disabled || !canSend;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isInputDisabled}
          placeholder={canSend ? `Send a message... (${remainingMessages} left)` : "Limit reached (5 messages)"}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={isInputDisabled}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {!canSend && (
        <p className="text-gray-500 text-sm">You've reached the 5-message limit for this match.</p>
      )}
      {canSend && remainingMessages < 5 && (
        <p className="text-blue-500 text-sm">{remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining</p>
      )}
    </div>
  );
} 