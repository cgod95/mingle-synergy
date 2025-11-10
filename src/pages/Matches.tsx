// 🧠 Purpose: Unified Matches & Chats page - like dating apps
// Shows all matches with last message preview, avatar, and countdown timer at top

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { getActiveMatches, getRemainingSeconds, type Match } from "@/lib/matchesCompat";
import { getLastMessage } from "@/lib/chatStore";
import { timeAgo } from "@/lib/timeago";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MatchListSkeleton } from "@/components/ui/LoadingStates";

type MatchWithPreview = Match & {
  lastMessage?: string;
  lastMessageTime?: number;
};

export default function Matches() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [earliestExpiry, setEarliestExpiry] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }
      
      // In demo mode, ensure data is seeded if matches list is empty
      if (import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.MODE === 'development') {
        try {
          const { ensureDemoLikesSeed } = await import('@/lib/likesStore');
          const { ensureDemoThreadsSeed } = await import('@/lib/chatStore');
          ensureDemoLikesSeed();
          ensureDemoThreadsSeed();
        } catch (error) {
          console.warn('Failed to seed demo data:', error);
        }
      }
      
      setIsLoading(true);
      try {
        const activeMatches = await getActiveMatches(currentUser.uid);
        
        // Enrich with last message preview
        const enrichedMatches: MatchWithPreview[] = activeMatches.map((match) => {
          const lastMsg = getLastMessage(match.id);
          return {
            ...match,
            lastMessage: lastMsg?.text,
            lastMessageTime: lastMsg?.ts,
          };
        });

        // Sort by last message time (most recent first), then by expiry (soonest first)
        enrichedMatches.sort((a, b) => {
          if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime - a.lastMessageTime;
          }
          if (a.lastMessageTime) return -1;
          if (b.lastMessageTime) return 1;
          return a.expiresAt - b.expiresAt; // Soonest expiry first
        });

        setMatches(enrichedMatches);

        // Find earliest expiry for countdown timer
        if (enrichedMatches.length > 0) {
          const earliest = Math.min(...enrichedMatches.map(m => m.expiresAt));
          setEarliestExpiry(earliest);
        } else {
          setEarliestExpiry(null);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Update countdown timer every second
  useEffect(() => {
    if (!earliestExpiry) {
      setCountdown("");
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = earliestExpiry - now;
      
      if (remaining <= 0) {
        setCountdown("Expired");
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [earliestExpiry]);

  const formatRemainingTime = (expiresAt: number): string => {
    const remaining = getRemainingSeconds({ expiresAt } as Match);
    if (remaining === 0) return "Expired";
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleMatchClick = (matchId: string) => {
    navigate(`/chat/${matchId}`);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20">
        {/* Countdown Timer Banner - Fixed at top */}
        {earliestExpiry && countdown && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
          >
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-lg">
                Your earliest match expires in {countdown}
              </span>
            </div>
          </motion.div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-800 mb-2">Matches</h1>
            <p className="text-lg text-neutral-600">Your conversations</p>
          </motion.div>

          {isLoading ? (
            <MatchListSkeleton />
          ) : matches.length === 0 ? (
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
            <div className="space-y-3">
              <AnimatePresence>
                {matches.map((match, index) => {
                  const remainingTime = formatRemainingTime(match.expiresAt);
                  const isExpiringSoon = getRemainingSeconds(match) < 30 * 60; // Less than 30 minutes
                  
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer hover:shadow-xl transition-all border-2 ${
                          isExpiringSoon
                            ? "border-orange-300 bg-orange-50/50"
                            : "border-neutral-200 hover:border-indigo-300 bg-white"
                        }`}
                        onClick={() => handleMatchClick(match.id)}
                      >
                        <div className="flex items-center gap-4 px-6 py-5">
                          {/* Avatar */}
                          <Avatar className="h-16 w-16 flex-shrink-0 ring-2 ring-indigo-100">
                            {match.avatarUrl ? (
                              <AvatarImage 
                                src={match.avatarUrl} 
                                alt={match.displayName || "Match"} 
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "";
                                }}
                              />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-bold text-xl">
                              {(match.displayName || "M").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-neutral-800 truncate">
                                  {match.displayName || "Match"}
                                </h3>
                                {match.unreadCount && match.unreadCount > 0 && (
                                  <Badge className="bg-indigo-500 text-white text-xs px-2 py-0">
                                    {match.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isExpiringSoon && (
                                  <Badge variant="destructive" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {remainingTime}
                                  </Badge>
                                )}
                                {match.lastMessageTime && (
                                  <span className="text-xs text-neutral-500 font-medium">
                                    {timeAgo(match.lastMessageTime)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Last Message Preview */}
                            <div className="flex items-center gap-2">
                              {match.lastMessage ? (
                                <>
                                  <MessageCircle className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                  <p className="text-sm text-neutral-600 truncate flex-1">
                                    {match.lastMessage}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-neutral-500 italic">
                                  Start the conversation...
                                </p>
                              )}
                            </div>

                            {/* Time Remaining Badge */}
                            {!isExpiringSoon && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs text-neutral-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {remainingTime} left
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}
