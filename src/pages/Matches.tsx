
import React from 'react';
import Header from '@/components/Header';
import { matches, users, venues } from '@/data/mockData';
import { User, Match as MatchType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Share2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Matches = () => {
  const currentUserId = 'u1'; // In a real app, this would come from auth
  const { toast } = useToast();
  
  // Get matches for current user, limited to 10 most recent
  const userMatches = matches
    .filter(match => 
      (match.userId === currentUserId || match.matchedUserId === currentUserId) && 
      match.isActive && 
      match.expiresAt > Date.now()
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
  
  // Find matched users from the userMatches
  const matchedUsers = userMatches.map(match => {
    const matchedUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
    const user = users.find(u => u.id === matchedUserId);
    return { match, user };
  }).filter(({ user }) => user !== undefined);
  
  const handleShareContact = (matchId: string) => {
    toast({
      title: "Contact Shared",
      description: "If they also share their contact, you'll both receive each other's info.",
    });
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-24">
      <Header title="Matches" />
      
      <main className="container mx-auto px-4 mt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Your Matches</h2>
          <p className="text-muted-foreground">
            Matches expire in 3 hours, connect with people before time runs out!
          </p>
        </div>
        
        {matchedUsers.length > 0 ? (
          <div className="space-y-4">
            {matchedUsers.map(({ match, user }) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                user={user as User} 
                currentUserId={currentUserId}
                onShareContact={() => handleShareContact(match.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No matches yet</h3>
            <p className="text-muted-foreground max-w-md">
              Check in to venues to meet people and create connections!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

const MatchCard = ({ 
  match, 
  user, 
  currentUserId,
  onShareContact
}: { 
  match: MatchType; 
  user: User; 
  currentUserId: string;
  onShareContact: () => void;
}) => {
  const timeLeft = formatDistanceToNow(match.expiresAt, { addSuffix: true });
  const venue = venues.find(v => v.id === match.venueId);
  
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card animate-scale-in">
      <div className="flex items-center p-4">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
          <img 
            src={user.photos[0]} 
            alt={user.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium">{user.name}</h3>
          <p className="text-sm text-muted-foreground">
            Matched at {venue?.name || 'a venue'}
          </p>
          <p className="text-xs text-muted-foreground">
            Expires {timeLeft}
          </p>
        </div>
        
        <button 
          className="bg-[#3A86FF] text-white px-4 py-2 rounded-lg text-sm flex items-center"
          onClick={onShareContact}
        >
          {match.contactShared ? 'Shared' : 'Share Contact'} 
          {!match.contactShared && <Share2 className="ml-1 w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default Matches;
