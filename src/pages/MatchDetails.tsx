import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Match } from '@/types';
import ChatView from '@/components/ChatView';
import { useAuth } from '@/context/AuthContext';
import { mockMatches } from '@/data/mock';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';

export default function MatchDetailsPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { currentUser } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      
      // Find match in mock data
      const foundMatch = mockMatches.find(m => m.id === matchId);
      if (foundMatch) {
        setMatch(foundMatch);
      }
      setLoading(false);
    };

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <Layout>
        <div className="p-4 text-center pb-20">
          <p>Loading chat...</p>
        </div>
        <BottomNav />
      </Layout>
    );
  }
  
  if (!match || !currentUser) {
    return (
      <Layout>
        <div className="p-4 text-center pb-20">
          <p>Match not found or not authorized.</p>
        </div>
        <BottomNav />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 h-[80vh] pb-20">
        <h1 className="text-xl font-bold mb-4 text-center">Chat</h1>
        <ChatView match={match} currentUserId={currentUser.uid} />
      </div>
      <BottomNav />
    </Layout>
  );
} 