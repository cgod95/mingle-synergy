// 🧠 Purpose: Implement Matches page UI to display matched users from mock data.

import React, { useState } from "react";
import MatchCard from "@/components/MatchCard";
import { DisplayMatch } from "@/types/match";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import BottomNav from '../components/BottomNav';
import ErrorBoundary from '../components/ErrorBoundary';
import WeMetConfirmationModal from "@/components/WeMetConfirmationModal";
import { getUserMatches, mockUsers } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";

const Matches: React.FC = () => {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<DisplayMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser) return;
      try {
        // Use mock data instead of Firebase
        const currentUserId = currentUser.uid || 'u1'; // Default to u1 for demo
        const userMatches = getUserMatches(currentUserId);
        
        const displayMatches: DisplayMatch[] = userMatches.map((match) => {
          const matchedUserId = match.userId === currentUserId ? match.matchedUserId : match.userId;
          const matchedUser = mockUsers.find(user => user.id === matchedUserId);
          
          return {
            id: match.id,
            name: matchedUser?.name || "Unknown",
            age: matchedUser?.age || 0,
            bio: matchedUser?.bio || "",
            photoUrl: matchedUser?.photos?.[0] || "",
          };
        });

        setMatches(displayMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, [currentUser]);

  const handleWeMetClick = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!currentUser || !selectedMatchId) return;
    
    // Show success toast
    toast({
      title: "We Met! 🎉",
      description: "Thanks for confirming! Your match has been updated.",
      duration: 3000,
    });
    
    setShowConfirmation(false);
    setSelectedMatchId(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedMatchId(null);
  };

  return (
    <ErrorBoundary>
      <div className="pb-16 p-4">
        <h1 className="text-xl font-semibold mb-4">Your Matches</h1>
        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No matches yet. Check into a venue to meet people!</p>
          ) : (
            matches.map((match) => (
              <MatchCard key={match.id} match={match} onWeMetClick={handleWeMetClick} />
            ))
          )}
        </div>
      </div>
      <BottomNav />

      {/* Confirmation Modal */}
      <WeMetConfirmationModal
        open={showConfirmation}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ErrorBoundary>
  );
};

export default Matches;