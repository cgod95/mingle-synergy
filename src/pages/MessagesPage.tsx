import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/ui/skeleton';
import { getUserMatches } from '@/data/mock/matches';
import { mockUsers } from '@/data/mock/users';
import { Match, User } from '@/types';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';
import { MessageCircle, Clock, MapPin } from 'lucide-react';

export default function MessagesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        // For demo, use user u1
        const userMatches = getUserMatches('u1');
        setMatches(userMatches);

        // Get matched users data
        const users = userMatches.map(match => {
          const matchedUser = mockUsers.find(user => user.id === match.matchedUserId);
          return matchedUser;
        }).filter(Boolean) as User[];

        setMatchedUsers(users);
      } catch (err) {
        console.error('Error loading matches:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8 pb-24">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>
            <p className="text-neutral-600">Your conversations</p>
          </div>
          <ListSkeleton count={6} />
        </div>
        <BottomNav />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh] pb-24">
          <div className="text-center space-y-4">
            <p className="text-neutral-600">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
        <BottomNav />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-24">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>
          <p className="text-neutral-600">Your conversations</p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center space-y-4 py-12">
            <MessageCircle className="w-16 h-16 text-neutral-300 mx-auto" />
            <h3 className="text-lg font-semibold text-neutral-900">No messages yet</h3>
            <p className="text-neutral-600">Start matching to begin conversations!</p>
            <Link to="/venues">
              <Button>Explore Venues</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => {
              const matchedUser = matchedUsers[index];
              if (!matchedUser) return null;

              const timeRemaining = formatTimeRemaining(match.expiresAt);
              const isExpired = match.expiresAt <= Date.now();

              return (
                <Link key={match.id} to={`/messages/${match.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={matchedUser.photos[0]}
                            alt={matchedUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <CardTitle className="text-lg">{matchedUser.name}</CardTitle>
                            <div className="flex items-center text-sm text-neutral-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              {match.venueName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            isExpired ? 'text-red-600' : 'text-neutral-600'
                          }`}>
                            <Clock className="w-4 h-4 inline mr-1" />
                            {timeRemaining}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {match.message && (
                          <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg">
                            "{match.message}"
                          </p>
                        )}
                        {match.receivedMessage && (
                          <p className="text-sm text-neutral-600">
                            {matchedUser.name}: "{match.receivedMessage}"
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </Layout>
  );
} 