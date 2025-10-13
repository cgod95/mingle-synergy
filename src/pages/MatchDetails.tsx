import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Match } from '@/types';
import ChatView from '@/components/ChatView';
import { useAuth } from '@/context/AuthContext';
import PrivateLayout from '@/components/PrivateLayout';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import matchService from '@/services/firebase/matchService';
import userService from '@/services/firebase/userService';
import { UserProfile } from '@/types/services';

export default function MatchDetailsPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { currentUser } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId || !currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch match from Firestore
        const firestoreMatch = await matchService.getMatchById(matchId);
        if (!firestoreMatch) {
          setError('Match not found');
          setLoading(false);
          return;
        }
        
        // Convert Firestore match format to ChatView expected format
        const adaptedMatch: Match = {
          id: firestoreMatch.id,
          userId: firestoreMatch.userId1,
          matchedUserId: firestoreMatch.userId2,
          venueId: firestoreMatch.venueId,
          timestamp: firestoreMatch.timestamp,
          isActive: !firestoreMatch.matchExpired,
          expiresAt: firestoreMatch.timestamp + (3 * 60 * 60 * 1000), // 3 hours
          contactShared: false,
        };
        
        setMatch(adaptedMatch);
        
        // Fetch other user's profile
        const otherUserId = firestoreMatch.userId1 === currentUser.uid ? firestoreMatch.userId2 : firestoreMatch.userId1;
        const otherUserProfile = await userService.getUserProfile(otherUserId);
        setOtherUser(otherUserProfile);
        
      } catch (err) {
        console.error('Error fetching match:', err);
        setError('Failed to load match');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, currentUser]);

  if (loading) {
    return (
      <PrivateLayout>
        <div className="p-4 text-center pb-20">
          <p>Loading chat...</p>
        </div>
        <BottomNav />
      </PrivateLayout>
    );
  }
  
  if (!match || !currentUser || error) {
    return (
      <PrivateLayout>
        <div className="p-4 text-center pb-20">
          <p>{error || 'Match not found or not authorized.'}</p>
        </div>
        <BottomNav />
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="max-w-2xl mx-auto p-4 h-[80vh] pb-20">
        <h1 className="text-xl font-bold mb-4 text-center">Match Details</h1>
        <div className="bg-white rounded-lg p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Match Details</h2>
          <p className="text-mingle-muted mb-4">Match ID: {match.id}</p>
          {otherUser && (
            <div className="mb-4">
              <p className="text-sm text-mingle-muted">Matched with: {otherUser.name}</p>
            </div>
          )}
          <Link to={`/chat/${match.id}`}>
            <Button className="w-full">
              Open Chat
            </Button>
          </Link>
        </div>
        <ChatView match={match} currentUserId={currentUser.uid} />
      </div>
      <BottomNav />
    </PrivateLayout>
  );
} 