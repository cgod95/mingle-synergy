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
import { logError } from '@/utils/errorHandler';
import { FEATURE_FLAGS } from '@/lib/flags';

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
          logError(error as Error, { source: 'Chat', action: 'fetchOtherUserProfile', matchId, otherUserId });
        }
      } catch (err) {
        setError('Failed to load match.');
        logError(err as Error, { source: 'Chat', action: 'fetchMatch', matchId });
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
      logError(err as Error, { source: 'Chat', action: 'sendMessage', matchId });
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
      logError(err as Error, { source: 'Chat', action: 'confirmWeMet', matchId });
      setWeMetStatus("error");
    }
  };

  const isExpired = match && Date.now() - match.timestamp > 3 * 60 * 60 * 1000;
  const myMessages = match?.messages?.filter(m => m.senderId === currentUser?.uid) ?? [];
  const messageLimit = typeof FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER === 'number' && FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER > 0 ? FEATURE_FLAGS.LIMIT_MESSAGES_PER_USER : 5;
  const canSend = !isExpired && myMessages.length < messageLimit;

  if (!matchId) {
    return <PageError error="Invalid match ID." />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="max-w-xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Chat</h2>
          {!isExpired && otherUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWeMetModal(true)}
              disabled={weMetStatus === "confirming" || weMetStatus === "confirmed"}
              className="text-green-700 border-green-300 hover:bg-green-50"
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

            <div className="bg-white rounded-xl border border-neutral-200 p-4 h-96 overflow-y-auto mb-4">
              {match.messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-neutral-400 italic">No messages yet. Start the conversation!</p>
                </div>
              )}
              {match.messages.map((msg, i) => {
                const isSent = msg.senderId === currentUser?.uid;
                return (
                  <div key={i} className={`flex mb-3 ${isSent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isSent 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-neutral-100 text-neutral-900 rounded-tl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {isExpired ? (
              <ReconnectionPrompt name={otherUser?.name || 'your match'} />
            ) : !canSend ? (
              <MessageLimitNotice />
            ) : (
              <div className="bg-white border-t border-neutral-200 p-4">
                <div className="flex items-end gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-2xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                    placeholder={`Type your message... (${messageLimit - myMessages.length} left)`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 p-0 flex-shrink-0"
                  >
                    {sending ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
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