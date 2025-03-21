
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { matches, users, venues } from '@/data/mockData';
import { User, Match as MatchType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Share2, Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Matches = () => {
  const currentUserId = 'u1'; // In a real app, this would come from auth
  const { toast } = useToast();
  
  // Get matches for current user, limited to 10 most recent
  const [userMatches, setUserMatches] = useState<MatchType[]>([]);
  const [sentMessages, setSentMessages] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Load matches from localStorage or fall back to mock data
    const storedMatches = localStorage.getItem('userMatches');
    const storedMessages = localStorage.getItem('sentMessages');
    
    if (storedMatches) {
      setUserMatches(JSON.parse(storedMatches));
    } else {
      const filteredMatches = matches
        .filter(match => 
          (match.userId === currentUserId || match.matchedUserId === currentUserId) && 
          match.isActive && 
          match.expiresAt > Date.now()
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
        
      setUserMatches(filteredMatches);
      localStorage.setItem('userMatches', JSON.stringify(filteredMatches));
    }
    
    if (storedMessages) {
      setSentMessages(JSON.parse(storedMessages));
    }
  }, []);
  
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
  
  const handleSendMessage = (matchId: string, message: string) => {
    if (message.trim()) {
      const newMessages = { ...sentMessages, [matchId]: message };
      setSentMessages(newMessages);
      localStorage.setItem('sentMessages', JSON.stringify(newMessages));
      
      toast({
        title: "Message Sent",
        description: "Your message has been delivered.",
      });
    }
  };
  
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">We had trouble loading your matches.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      }
    >
      <div className="min-h-screen bg-background text-foreground pt-16 pb-24">
        <Header title="Mingle" />
        
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
                  onSendMessage={(message) => handleSendMessage(match.id, message)}
                  sentMessage={sentMessages[match.id]}
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
    </ErrorBoundary>
  );
};

interface MatchCardProps { 
  match: MatchType; 
  user: User; 
  currentUserId: string;
  onShareContact: () => void;
  onSendMessage: (message: string) => void;
  sentMessage?: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  user, 
  currentUserId,
  onShareContact,
  onSendMessage,
  sentMessage
}) => {
  const [message, setMessage] = useState('');
  const timeLeft = formatDistanceToNow(match.expiresAt, { addSuffix: true });
  const venue = venues.find(v => v.id === match.venueId);
  
  const expiryTimeInHours = Math.max(0, (match.expiresAt - Date.now()) / (1000 * 60 * 60));
  const hours = Math.floor(expiryTimeInHours);
  const minutes = Math.floor((expiryTimeInHours - hours) * 60);
  const formattedExpiry = `Expires in ${hours}h ${minutes}m`;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card animate-scale-in shadow-bubble">
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
            {formattedExpiry}
          </p>
        </div>
        
        {!match.contactShared && (
          <Button 
            onClick={onShareContact}
            className="rounded-full"
          >
            Share Contact 
            <Share2 className="ml-1 w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Message section */}
      <div className="p-4 pt-0">
        {sentMessage ? (
          <div className="message-bubble">{sentMessage}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Textarea
              placeholder="Tell them where you are..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 100))}
              className="flex-1 resize-none rounded-2xl"
              maxLength={100}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
        
        {message && (
          <p className="text-xs text-right text-muted-foreground mt-1">
            {message.length}/100
          </p>
        )}
      </div>
    </div>
  );
};

export default Matches;
