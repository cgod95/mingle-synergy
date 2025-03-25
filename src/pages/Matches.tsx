import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import MatchCard from '@/components/matches/MatchCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useToast } from '@/components/ui/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Match, User } from '@/types';
import contactService from '@/services/firebase/contactService';
import matchService from '@/services/firebase/matchService';
import { withAnalytics } from '@/components/withAnalytics';
import { ContactInfo } from '@/types/contactInfo';

interface UserWithId extends User {
  id: string;
}

const Matches: React.FC = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchUsers, setMatchUsers] = useState<Record<string, UserWithId>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadMatches = async () => {
      if (!currentUser) return;
      
      const typedCurrentUser = currentUser as UserWithId;
      
      setLoading(true);
      
      try {
        const userMatches = await matchService.getMatches(typedCurrentUser.id);
        setMatches(userMatches);
        
        const users: Record<string, UserWithId> = {};
        userMatches.forEach(match => {
          const matchedUserId = match.userId === typedCurrentUser.id 
            ? match.matchedUserId 
            : match.userId;
          
          users[matchedUserId] = {
            id: matchedUserId,
            name: `User ${matchedUserId.substring(0, 4)}`,
            photos: ['https://randomuser.me/api/portraits/men/32.jpg'],
            isCheckedIn: false,
            isVisible: true,
            interests: ['coffee', 'music']
          };
        });
        
        setMatchUsers(users);
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
  
  const handleShareContact = async (matchId: string, contactInfo: ContactInfo): Promise<boolean> => {
    if (!currentUser) return false;
    
    const typedCurrentUser = currentUser as UserWithId;
    
    try {
      await contactService.shareContactInfo(matchId, {
        ...contactInfo,
        sharedBy: typedCurrentUser.id,
        sharedAt: new Date().toISOString()
      });
      
      setMatches(prev => 
        prev.map(match => 
          match.id === matchId 
            ? { 
                ...match, 
                contactShared: true, 
                contactInfo: {
                  ...contactInfo,
                  sharedBy: typedCurrentUser.id,
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
  
  if (authLoading || loading) {
    return <LoadingScreen message="Loading matches..." />;
  }
  
  const activeMatches = matches.filter(match => 
    match.isActive && match.expiresAt > Date.now()
  );
  
  const expiredMatches = matches.filter(match => 
    !match.isActive || match.expiresAt <= Date.now()
  );
  
  const getMatchedUser = (match: Match): UserWithId => {
    const typedCurrentUser = currentUser as UserWithId;
    
    const matchedUserId = match.userId === typedCurrentUser.id 
      ? match.matchedUserId 
      : match.userId;
    
    return matchUsers[matchedUserId] || {
      id: matchedUserId,
      name: 'Unknown User',
      photos: ['https://via.placeholder.com/150'],
      isCheckedIn: false,
      isVisible: true,
      interests: []
    };
  };
  
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
                        user={getMatchedUser(match)}
                        onShareContact={handleShareContact}
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
                        user={getMatchedUser(match)}
                        onShareContact={handleShareContact}
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
