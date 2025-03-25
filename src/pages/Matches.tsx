
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import MatchCard from '@/components/matches/MatchCard';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useToast } from '@/components/ui/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Match, MatchUser, ContactInfo } from '@/types/match.types';
import { withAnalytics } from '@/components/withAnalytics';

const Matches: React.FC = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadMatches = async () => {
      if (!currentUser) return;
      
      // Safely create a user ID from currentUser
      const userId = (currentUser as any).id || '';
      
      setLoading(true);
      
      try {
        // In a real app, fetch matches from Firestore
        // For now, we'll use mock data
        const mockMatches: Match[] = [
          {
            id: 'match1',
            userId: userId,
            matchedUserId: 'user1',
            venueId: 'venue1',
            venueName: 'The Grand Cafe',
            timestamp: Date.now() - 1000000, // A little while ago
            isActive: true,
            expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2 hours from now
            contactShared: false,
            matchedUser: {
              id: 'user1',
              name: 'Alex',
              age: 28,
              photos: ['https://randomuser.me/api/portraits/men/32.jpg'],
              interests: ['coffee', 'hiking'],
              isCheckedIn: false,
              isVisible: true
            }
          },
          {
            id: 'match2',
            userId: userId,
            matchedUserId: 'user2',
            venueId: 'venue2',
            venueName: 'Skybar Lounge',
            timestamp: Date.now() - 3000000, // A while ago
            isActive: true,
            expiresAt: Date.now() + (1 * 60 * 60 * 1000), // 1 hour from now
            contactShared: false,
            matchedUser: {
              id: 'user2',
              name: 'Jordan',
              age: 26,
              photos: ['https://randomuser.me/api/portraits/women/44.jpg'],
              interests: ['cocktails', 'music'],
              isCheckedIn: false,
              isVisible: true
            }
          },
          {
            id: 'match3',
            userId: userId,
            matchedUserId: 'user3',
            venueId: 'venue3',
            venueName: 'Beachside Brewery',
            timestamp: Date.now() - 4000000, // A while ago
            isActive: true,
            expiresAt: Date.now() - (30 * 60 * 1000), // Expired 30 minutes ago
            contactShared: true,
            contactInfo: {
              type: 'instagram',
              value: '@taylor_insta',
              sharedBy: userId,
              sharedAt: Date.now() - 100000
            },
            matchedUser: {
              id: 'user3',
              name: 'Taylor',
              age: 30,
              photos: ['https://randomuser.me/api/portraits/women/22.jpg'],
              interests: ['craft beer', 'beach volleyball'],
              isCheckedIn: false,
              isVisible: true
            }
          }
        ];
        
        setMatches(mockMatches);
      } catch (error) {
        console.error('Error loading matches:', error);
        toast({
          title: "Couldn't load matches",
          description: "There was a problem loading your matches.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
  }, [currentUser, toast]);
  
  // Handle share contact
  const handleShareContact = async (matchId: string, contactInfo: ContactInfo): Promise<boolean> => {
    if (!currentUser) return false;

    // Safely create a user ID from currentUser
    const userId = (currentUser as any).id || '';
    
    try {
      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId 
            ? { 
                ...match, 
                contactShared: true, 
                contactInfo: {
                  ...contactInfo,
                  sharedBy: userId,
                  sharedAt: new Date().toISOString()
                }
              } 
            : match
        )
      );
      
      toast({
        title: "Contact Shared",
        description: "Your contact information has been shared with your match.",
      });
      
      return true;
    } catch (error) {
      console.error('Error sharing contact:', error);
      toast({
        title: "Couldn't share contact",
        description: "There was a problem sharing your contact information.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Handle reconnect request
  const handleReconnectRequest = async (matchId: string): Promise<boolean> => {
    try {
      console.log(`Requesting reconnect for match ${matchId}`);
      
      toast({
        title: "Reconnect Requested",
        description: "You've requested to reconnect with this match.",
      });
      
      return true;
    } catch (error) {
      console.error('Error requesting reconnect:', error);
      toast({
        title: "Couldn't request reconnect",
        description: "There was a problem requesting to reconnect.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Handle "we met" confirmation
  const handleWeMetClick = async (matchId: string): Promise<boolean> => {
    try {
      console.log(`Confirming we met for match ${matchId}`);
      
      toast({
        title: "Meeting Confirmed",
        description: "You've confirmed that you met with this match.",
      });
      
      return true;
    } catch (error) {
      console.error('Error confirming meeting:', error);
      toast({
        title: "Couldn't confirm meeting",
        description: "There was a problem confirming your meeting.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  if (authLoading || loading) {
    return <LoadingScreen message="Loading matches..." />;
  }
  
  // Separate active and expired matches
  const activeMatches = matches.filter(match => 
    match.isActive && match.expiresAt > Date.now()
  );
  
  const expiredMatches = matches.filter(match => 
    !match.isActive || match.expiresAt <= Date.now()
  );
  
  return (
    <ErrorBoundary
      fallback={<div className="p-4 text-center">Something went wrong loading your matches</div>}
    >
      <div className="min-h-screen bg-background pb-24">
        <Header title="Matches" />
        
        <main className="container mx-auto p-4 mt-16">
          {activeMatches.length === 0 && expiredMatches.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="font-medium">No matches yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Check in to venues to meet people
              </p>
            </div>
          ) : (
            <>
              {activeMatches.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold mb-3">
                    Active Matches ({activeMatches.length})
                  </h2>
                  
                  <div className="space-y-4 mb-8">
                    {activeMatches.map(match => (
                      <MatchCard 
                        key={match.id}
                        match={match}
                        user={match.matchedUser as MatchUser}
                        onShareContact={handleShareContact}
                        onReconnectRequest={handleReconnectRequest}
                        onWeMetClick={handleWeMetClick}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {expiredMatches.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold mb-3">
                    Past Matches ({expiredMatches.length})
                  </h2>
                  
                  <div className="space-y-4">
                    {expiredMatches.map(match => (
                      <MatchCard 
                        key={match.id}
                        match={match}
                        user={match.matchedUser as MatchUser}
                        onShareContact={handleShareContact}
                        onReconnectRequest={handleReconnectRequest}
                        onWeMetClick={handleWeMetClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default withAnalytics(Matches, 'matches_screen');
