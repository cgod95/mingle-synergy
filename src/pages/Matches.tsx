
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
}

const MatchCard: React.FC<MatchCardProps> = ({ match, user }) => {
  const [hasSharedContact, setHasSharedContact] = useState(match.contactShared);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  
  const handleShareContact = () => {
    // Update match in state and localStorage
    const updatedMatch = { ...match, contactShared: true };
    const storedMatches = localStorage.getItem('userMatches');
    if (storedMatches) {
      const matches = JSON.parse(storedMatches);
      const updatedMatches = matches.map((m: MatchType) => 
        m.id === match.id ? updatedMatch : m
      );
      localStorage.setItem('userMatches', JSON.stringify(updatedMatches));
    }
    setHasSharedContact(true);
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    setShowMessage(true);
    // You would normally save this message to a messages array
  };
  
  // Calculate time remaining
  const timeRemaining = () => {
    const now = Date.now();
    const remaining = match.expiresAt - now;
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center">
          <img 
            src={user.photos[0]} 
            alt={user.name} 
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
          />
          <div className="ml-3 flex-1">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-sm text-gray-600">
              Matched at {match.venueId.replace(/-/g, ' ')}
            </p>
            <p className="text-xs text-gray-500">
              Expires in {timeRemaining()}
            </p>
          </div>
          <button
            onClick={handleShareContact}
            disabled={hasSharedContact}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              hasSharedContact 
                ? 'bg-gray-100 text-gray-500' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {hasSharedContact ? 'Shared' : 'Share Contact'}
          </button>
        </div>
        
        {showMessage && (
          <div className="mt-4">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-tl-lg rounded-tr-lg rounded-br-lg inline-block max-w-[85%] ml-auto">
              {message}
            </div>
          </div>
        )}
        
        {!showMessage && (
          <div className="mt-4 flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them where you are..."
              className="flex-1 border border-gray-200 rounded-l-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={100}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className={`px-4 py-2 rounded-r-full text-sm font-medium ${
                !message.trim() 
                  ? 'bg-gray-100 text-gray-500' 
                  : 'bg-blue-500 text-white'
              }`}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
