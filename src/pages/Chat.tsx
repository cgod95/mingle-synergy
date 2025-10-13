import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import matchService, { confirmWeMet } from '@/services/firebase/matchService';
import userService from '@/services/firebase/userService';
import { FirestoreMatch } from '@/types/match';
import { UserProfile } from '@/types/UserProfile';
import ExpiredMatchNotice from '@/components/ExpiredMatchNotice';
import MessageLimitNotice from '@/components/Notices/MessageLimitNotice';
import ReconnectionPrompt from '@/components/ReconnectionPrompt';
import { LoadingSpinner, PageError } from '@/components/StatusFallbacks';
import { ErrorAlert } from '@/components/FeedbackUtils';
import WeMetConfirmationModal from '@/components/WeMetConfirmationModal';
import { Button } from '@/components/ui/button';
import logger from '@/utils/Logger';

const Chat: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { currentUser } = useAuth();
  const [match, setMatch] = useState<FirestoreMatch | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWeMetModal, setShowWeMetModal] = useState(false);
  const [weMetStatus, setWeMetStatus] = useState<"idle" | "confirming" | "confirmed" | "error">("idle");

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId || !currentUser?.uid) return;
      setLoading(true);
      try {
        const matchData = await matchService.getMatchById(matchId);
        if (!matchData) {
          setError('Match not found.');
          return;
        }
        setMatch(matchData);
        
        // Fetch the other user's profile
        const otherUserId = matchData.userId1 === currentUser.uid ? matchData.userId2 : matchData.userId1;
        try {
          const userProfile = await userService.getUserProfile(otherUserId);
          setOtherUser(userProfile);
        } catch (error) {
          logger.error('Error fetching other user profile:', error);
        }
      } catch (err) {
        setError('Failed to load match.');
        logger.error('Error fetching match:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId, currentUser]);

  const handleSend = async () => {
    if (!message.trim() || !match || !currentUser?.uid) return;
    setSending(true);
    setError('');
    
    try {
      await matchService.sendMessage(match.id, currentUser.uid, message.trim());
      setMessage('');
      
      // Refresh match data to get updated messages
      const updated = await matchService.getMatchById(match.id);
      setMatch(updated);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message.';
      setError(errorMessage);
      logger.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleWeMetConfirm = async () => {
    if (!currentUser || !matchId) return;
    setWeMetStatus("confirming");
    
    try {
      await confirmWeMet(matchId, currentUser.uid);
      setWeMetStatus("confirmed");
      setShowWeMetModal(false);
      // You could add a success toast here
      setTimeout(() => setWeMetStatus("idle"), 2000);
    } catch (err) {
      logger.error("Error confirming we met:", err);
      setWeMetStatus("error");
    }
  };

  const isExpired = match && Date.now() - match.timestamp > 3 * 60 * 60 * 1000;
  const myMessages = match?.messages?.filter(m => m.senderId === currentUser?.uid) ?? [];
  const canSend = !isExpired && myMessages.length < 3;

  if (!matchId) {
    return <PageError error="Invalid match ID." />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="max-w-xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Chat</h2>
          {!isExpired && otherUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWeMetModal(true)}
              disabled={weMetStatus === "confirming" || weMetStatus === "confirmed"}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              {weMetStatus === "confirming" 
                ? "Confirming..." 
                : weMetStatus === "confirmed" 
                ? "Confirmed!" 
                : "We Met"}
            </Button>
          )}
        </div>

        {error && <ErrorAlert message={error} />}
        
        {weMetStatus === "error" && (
          <ErrorAlert message="Error confirming we met. Please try again." />
        )}

        {match ? (
          <>
            {isExpired && otherUser && (
              <ExpiredMatchNotice name={otherUser.name || 'your match'} />
            )}

            <div className="bg-white rounded-lg border p-4 h-96 overflow-y-auto mb-4">
              {match.messages.length === 0 && (
                <p className="text-gray-400 italic">No messages yet</p>
              )}
              {match.messages.map((msg, i) => (
                <div key={i} className={`mb-3 ${msg.senderId === currentUser?.uid ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    msg.senderId === currentUser?.uid 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {isExpired ? (
              <ReconnectionPrompt name={otherUser?.name || 'your match'} />
            ) : !canSend ? (
              <MessageLimitNotice />
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder={`Type your message... (${3 - myMessages.length} left)`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            )}
          </>
        ) : (
          <PageError error="Match not found." />
        )}
      </div>

      <WeMetConfirmationModal
        open={showWeMetModal}
        onConfirm={handleWeMetConfirm}
        onCancel={() => setShowWeMetModal(false)}
      />
    </>
  );
};

export default Chat; 