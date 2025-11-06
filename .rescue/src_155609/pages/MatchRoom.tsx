import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import matchService from '@/services/firebase/matchService';
import { FirestoreMatch } from '@/types/match';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";

const MatchRoom: React.FC = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [match, setMatch] = useState<FirestoreMatch | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!matchId || !currentUser?.uid) return;

    const fetchMatch = async () => {
      try {
        const fetchedMatch = await matchService.getMatchById(matchId);
        setMatch(fetchedMatch);
      } catch (err) {
        setError('Failed to load match');
      }
    };

    fetchMatch();
  }, [matchId, currentUser?.uid]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser || !match) return;
    setSending(true);
    try {
      await matchService.sendMessage(match.id, currentUser.uid, message.trim());
      setMessage('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (error) return <div className="p-4 text-red-600 text-center">{error}</div>;
  if (!match) return <div className="p-4 text-center">Loading match...</div>;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-6">
      <h1 className="text-4xl font-bold mb-4">You Matched!</h1>
      <p className="mb-8 text-gray-600 text-center">
        You and Jamie both liked each other. Start chatting before the match expires!
      </p>
      <Button onClick={() => (window.location.href = "/chat")}>
        Open Chat
      </Button>
    </div>
  );
};

export default MatchRoom; 