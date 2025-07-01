import { useEffect, useState } from 'react';
import MatchCard from '@/components/MatchCard';
import BottomNav from '@/components/BottomNav';
import { LoadingSpinner } from '@/components/StatusFallbacks';
import ReconnectionPrompt from '@/components/ReconnectionPrompt';
import ReconnectRequests from '@/components/ReconnectRequests';
import { TestReconnectRequest } from '@/components/TestReconnectRequest';
import { FirestoreMatch, DisplayMatch } from '@/types/match';
import { UserProfile } from '@/types/UserProfile';
import { getAllMatchesForUser } from '@/services/firebase/matchService';
import userService from '@/services/firebase/userService';
import { useAuth } from '@/context/AuthContext';

interface DisplayMatchWithExpiry extends DisplayMatch {
  isExpired: boolean;
  matchedAt: number;
}

const MatchesPage = () => {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<DisplayMatchWithExpiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        if (!currentUser) return;
        
        // Get all matches (including expired ones)
        const allMatches = await getAllMatchesForUser(currentUser.uid);

        const displayMatches: DisplayMatchWithExpiry[] = await Promise.all(
          allMatches.map(async (match) => {
            const matchedUserId =
              match.userId1 === currentUser.uid ? match.userId2 : match.userId1;
            const matchedUserProfile = await userService.getUserProfile(matchedUserId);

            const now = Date.now();
            const isExpired = now - match.timestamp > 3 * 60 * 60 * 1000; // 3 hours

            return {
              id: match.id,
              name: matchedUserProfile?.name || "Unknown",
              age: matchedUserProfile?.age || 0,
              bio: matchedUserProfile?.bio || "",
              photoUrl: matchedUserProfile?.photos?.[0] || "",
              isExpired,
              matchedAt: match.timestamp,
            };
          })
        );

        setMatches(displayMatches);
      } catch (err) {
        setError('Failed to fetch matches.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUser]);

  const activeMatches = matches.filter(match => !match.isExpired);
  const expiredMatches = matches.filter(match => match.isExpired);

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Your Matches</h1>

      <ReconnectionPrompt name="your matches" />
      <ReconnectRequests />
      {/* <TestReconnectRequest /> Uncomment if needed */}

      {loading && (
        <div className="flex justify-center mt-10">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center mt-4">{error}</div>
      )}

      {!loading && matches.length === 0 && (
        <div className="text-muted-foreground text-center mt-10">
          No matches yet. Keep checking in at venues!
        </div>
      )}

      {!loading && matches.length > 0 && (
        <>
          {/* Active Matches */}
          {activeMatches.length > 0 && (
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold">Active Matches</h2>
              {activeMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}

          {/* Expired Matches */}
          {expiredMatches.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Expired Matches</h2>
              {expiredMatches.map((match) => (
                <ReconnectionPrompt key={match.id} name={match.name} />
              ))}
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default MatchesPage; 