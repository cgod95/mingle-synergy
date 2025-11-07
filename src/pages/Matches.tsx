// 🧠 Purpose: Implement Matches page UI to display matched users from mock data.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import { DisplayMatch } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import BottomNav from '../components/BottomNav';
import ErrorBoundary from '../components/ErrorBoundary';
import WeMetConfirmationModal from "@/components/WeMetConfirmationModal";
import { getUserMatches, mockUsers } from "@/data/mock";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Matches: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
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

  const handleViewProfile = (userId: string) => {
    // Navigate to profile view - placeholder for now
    console.log("View profile:", userId);
  };

  const handleSendMessage = (matchId: string) => {
    navigate(`/chat/${matchId}`);
  };

  return (
    <ErrorBoundary>
      <div className="pb-16 p-4">
        <h1 className="text-xl font-semibold mb-4">Your Matches</h1>
        <div className="space-y-4">
          {matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4"
            >
              <div className="max-w-sm mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center"
                >
                  <Heart className="w-12 h-12 text-indigo-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">No matches yet</h3>
                <p className="text-neutral-600 mb-6">Check into a venue to start meeting people!</p>
                <Button
                  onClick={() => navigate('/checkin')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Find Venues
                </Button>
              </div>
            </motion.div>
          ) : (
            matches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onWeMetClick={handleWeMetClick}
                onViewProfile={handleViewProfile}
                onSendMessage={handleSendMessage}
              />
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