import { useEffect, useState } from 'react';
import MatchCard from '@/components/MatchCard';
import { withAnalytics } from '@/components/withAnalytics';
import { fetchMatches } from '@/services/firebase/userService';
import { fetchUserProfile } from '@/services/firebase/userService';
import { Match } from '@/types/match.types';
import { useUser } from '../hooks/useUser';
import ErrorBoundary from '@/components/ErrorBoundary';
import { UserProfile } from '@/types/UserProfile';

type EnrichedMatch = Match & { matchedUserProfile?: UserProfile };

const MatchesPage: React.FC = () => {
  const { currentUser } = useUser();
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      if (!currentUser) return;
      try {
        const rawMatches = await fetchMatches(currentUser.id);

        const enrichedMatches: EnrichedMatch[] = await Promise.all(
          rawMatches.map(async (match) => {
            const matchedUserProfile = await fetchUserProfile(match.matchedUserId);
            return { ...match, matchedUserProfile };
          })
        );

        setMatches(enrichedMatches);
      } catch (err) {
        console.error('Error loading matches:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, [currentUser]);

  return (
    <ErrorBoundary>
      <main className="p-4">
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : matches.length === 0 ? (
          <p className="text-center text-gray-600">No matches yet. Start liking!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) =>
              match.matchedUserProfile ? (
                <MatchCard
                  key={match.id}
                  match={match}
                  user={match.matchedUserProfile}
                  onReconnectRequest={() => console.log('Reconnect requested for', match.id)}
                  onShareContact={() => console.log('Share contact for', match.id)}
                  onWeMetClick={() => console.log('We met clicked for', match.id)}
                />
              ) : null
            )}
          </div>
        )}
      </main>
    </ErrorBoundary>
  );
};

export default withAnalytics(MatchesPage, 'matches_screen');