// 🧠 Purpose
// Create MessageInput component that allows sending messages in an active match chat.
// This is a core user-facing feature for the MVP chat experience.

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { mockMessages } from '@/data/mock';
import { Message } from '@/types';
import { logUserAction, logError } from '@/utils/errorHandler';
import config from '@/config';
// Firebase message sending
import { sendMessage as sendFirebaseMessage } from '@/services/firebase/matchService';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { FEATURE_FLAGS } from '@/lib/flags';

interface MessageInputProps {
  matchId: string;
  onMessageSent: () => void;
}

export default function MessageInput({ matchId, onMessageSent }: MessageInputProps) {
  const { currentUser } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingMessages, setRemainingMessages] = useState<number>(5);
  const [canSend, setCanSend] = useState(true);

  // Calculate remaining messages
  useEffect(() => {
    if (!currentUser?.uid || !matchId) return;

    const calculateRemaining = async () => {
      const messageLimit = typeof FEATURE_FLAGS?.LIMIT_MESSAGES_PER_USER === 'number' 
        ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER 
        : 5;

      if (config.DEMO_MODE) {
        // Demo mode: count from mock messages
        const userMessages = mockMessages.filter(
          msg => msg.matchId === matchId && msg.senderId === currentUser.uid
        );
        const remaining = Math.max(0, messageLimit - userMessages.length);
        setCanSend(remaining > 0);
        setRemainingMessages(remaining);
      } else {
        // Production: count from Firebase match document
        if (!firestore) return;
        try {
          const matchDoc = await getDoc(doc(firestore, 'matches', matchId));
          if (matchDoc.exists()) {
            const matchData = matchDoc.data();
            const userMessages = (matchData.messages || []).filter(
              (msg: { senderId: string }) => msg.senderId === currentUser.uid
            );
            const remaining = Math.max(0, messageLimit - userMessages.length);
            setCanSend(remaining > 0);
            setRemainingMessages(remaining);
          }
        } catch (err) {
          // Ignore errors, use default
        }
      }
    };

    calculateRemaining();
    // Re-check every 5 seconds (for real-time updates)
    const interval = config.DEMO_MODE ? null : setInterval(calculateRemaining, 5000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [matchId, currentUser?.uid]);

  const handleSend = async () => {
    if (!text.trim() || !currentUser?.uid || !canSend) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (config.DEMO_MODE) {
        // Demo mode: just log and clear (no actual persistence)
        logUserAction('message_sent', { matchId, messageLength: text.trim().length });
      } else {
        // Production: send to Firebase
        await sendFirebaseMessage(matchId, currentUser.uid, text.trim());
        logUserAction('message_sent', { matchId, messageLength: text.trim().length });
      }
      
      setText('');
      setRemainingMessages(prev => Math.max(0, prev - 1));
      if (remainingMessages <= 1) {
        setCanSend(false);
      }
      onMessageSent();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      logError(err instanceof Error ? err : new Error(errorMessage), {
        source: 'MessageInput',
        action: 'sendMessage',
        matchId
      });
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