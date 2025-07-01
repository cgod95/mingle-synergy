import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { FirestoreMatch } from '@/types/match';
import ChatView from '@/components/ChatView';
import { useAuth } from '@/context/AuthContext';

export default function MatchDetailsPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { currentUser } = useAuth();
  const [match, setMatch] = useState<FirestoreMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      const docRef = doc(firestore, 'matches', matchId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setMatch({ id: snap.id, ...(snap.data() as Omit<FirestoreMatch, 'id'>) });
      }
      setLoading(false);
    };

    fetchMatch();
  }, [matchId]);

  if (loading) return <p className="p-4 text-center">Loading chat...</p>;
  if (!match || !currentUser) return <p className="p-4 text-center">Match not found or not authorized.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 h-[80vh]">
      <h1 className="text-xl font-bold mb-4 text-center">Chat</h1>
      <ChatView match={match} currentUserId={currentUser.uid} />
    </div>
  );
} 