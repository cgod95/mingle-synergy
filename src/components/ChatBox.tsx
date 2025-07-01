import { useState, useEffect } from 'react';
import { canSendMessage, sendMessage } from '@/services/messageService';

type ChatBoxProps = {
  matchId: string;
  currentUserId: string;
  existingMessages: { senderId: string; text: string; timestamp: number }[];
};

export default function ChatBox({ matchId, currentUserId, existingMessages }: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const [canSend, setCanSend] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkMessageLimit = async () => {
      try {
        const allowed = await canSendMessage(matchId, currentUserId);
        setCanSend(allowed);
      } catch (error) {
        console.error('Error checking message limit:', error);
        setCanSend(false);
      }
    };
    checkMessageLimit();
  }, [matchId, currentUserId]);

  const handleSend = async () => {
    if (!canSend || !message.trim()) return;

    try {
      await sendMessage(matchId, currentUserId, message.trim());
      setMessage('');
      setError(null);
      
      // Re-check message limit after sending
      const allowed = await canSendMessage(matchId, currentUserId);
      setCanSend(allowed);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while sending the message';
      setError(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t">
      {!canSend ? (
        <p className="text-sm text-gray-500">You've reached the 3-message limit for this match.</p>
      ) : (
        <div className="flex flex-col space-y-2">
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message"
              disabled={!canSend}
            />
            <button 
              onClick={handleSend} 
              disabled={!canSend}
              className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              Send
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
      )}
    </div>
  );
} 