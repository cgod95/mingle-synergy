// 🧠 Purpose: Unified Matches & Chats page - like dating apps
// Shows all matches with last message preview, avatar, and countdown timer at top

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Clock, ArrowRight, MapPin, Filter, Sparkles } from "lucide-react";
import { getAllMatches, getRemainingSeconds, isExpired, type Match } from "@/lib/matchesCompat";
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

type FilterType = 'all' | 'active' | 'expired';

export default function Matches() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [earliestExpiry, setEarliestExpiry] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>('all');

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
          // Failed to seed demo data - non-critical
        }
      }
      
      setIsLoading(true);
      try {
        // Get all matches (including expired) for display
        const allMatches = await getAllMatches(currentUser.uid);
        
        // Enrich with last message preview
        const enrichedMatches: MatchWithPreview[] = allMatches.map((match) => {
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

        // Find earliest expiry for countdown timer (only for active matches)
        const activeMatches = enrichedMatches.filter(m => !isExpired(m));
        if (activeMatches.length > 0) {
          const earliest = Math.min(...activeMatches.map(m => m.expiresAt));
          setEarliestExpiry(earliest);
        } else {
          setEarliestExpiry(null);
        }
      } catch (error) {
        logError(error as Error, { context: 'Matches.fetchMatches', userId: currentUser?.uid || 'unknown' });
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

  // Filter matches based on selected filter
  const filteredMatches = matches.filter(match => {
    if (filter === 'active') return !isExpired(match);
    if (filter === 'expired') return isExpired(match);
    return true; // 'all'
  });

  // Calculate stats
  const activeMatches = matches.filter(m => !isExpired(m)).length;
  const expiredMatches = matches.filter(m => isExpired(m)).length;
  const totalMatches = matches.length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white pb-20">
        {/* Countdown Timer Banner - Fixed at top */}
        {earliestExpiry && countdown && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg"
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
          {/* Header with Stats */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Matches
                </h1>
                <p className="text-lg text-neutral-600">Your conversations</p>
              </div>
              {totalMatches > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {activeMatches} active
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Stats Cards */}
            {totalMatches > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-4 text-white shadow-lg"
                >
                  <div className="text-2xl font-bold">{totalMatches}</div>
                  <div className="text-sm opacity-90">Total</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg"
                >
                  <div className="text-2xl font-bold">{activeMatches}</div>
                  <div className="text-sm opacity-90">Active</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-neutral-400 to-neutral-500 rounded-xl p-4 text-white shadow-lg"
                >
                  <div className="text-2xl font-bold">{expiredMatches}</div>
                  <div className="text-sm opacity-90">Expired</div>
                </motion.div>
              </div>
            )}

            {/* How Mingle Works Info Card */}
            {totalMatches === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-800 mb-2">How Matches Work</h3>
                    <ul className="text-sm text-neutral-600 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span><strong>Check into a venue</strong> to see people there</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span><strong>Like someone</strong> - if they like you back, you match!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span><strong>Chat (5 messages)</strong> to make plans to meet up</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span><strong>Matches expire in 24 hours</strong> - reconnect by checking in again</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions - Filter Buttons */}
            {totalMatches > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-neutral-500" />
                <div className="flex gap-2">
                  {(['all', 'active', 'expired'] as FilterType[]).map((filterType) => (
                    <Button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      variant={filter === filterType ? 'default' : 'outline'}
                      size="sm"
                      className={
                        filter === filterType
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0'
                          : ''
                      }
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-neutral-500">
              💡 Matches last 24 hours. You can send 5 messages per match. Focus on meeting up in person!
            </p>
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
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center shadow-lg"
                >
                  <Heart className="w-12 h-12 text-indigo-400" />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  No matches yet
                </h3>
                <p className="text-neutral-600 mb-1">Check into a venue to start meeting people!</p>
                <p className="text-sm text-neutral-500 mb-6">
                  Like someone at a venue - if they like you back, you'll match!
                </p>
                <Button
                  onClick={() => navigate('/checkin')}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg"
                  size="lg"
                >
                  Find Venues
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredMatches.map((match, index) => {
                  const remainingTime = formatRemainingTime(match.expiresAt);
                  const isExpiringSoon = getRemainingSeconds(match) < 30 * 60; // Less than 30 minutes
                  const matchExpired = isExpired(match);
                  
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={matchExpired ? {} : { scale: 1.01, y: -2 }}
                      whileTap={matchExpired ? {} : { scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all border-2 overflow-hidden ${
                          matchExpired
                            ? "opacity-60 border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100"
                            : isExpiringSoon
                            ? "border-orange-300 bg-gradient-to-br from-orange-50/80 to-red-50/80 hover:shadow-xl hover:border-orange-400"
                            : "border-indigo-200 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 hover:shadow-xl hover:border-indigo-400"
                        }`}
                        onClick={() => handleMatchClick(match.id)}
                      >
                        <div className="flex items-center gap-4 px-6 py-5">
                          {/* Avatar with gradient ring */}
                          <Avatar className="h-20 w-20 flex-shrink-0 ring-4 ring-offset-2 ring-indigo-200/50">
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
                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white font-bold text-2xl">
                              {(match.displayName || "M").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <h3 className="font-bold text-xl text-neutral-800 truncate">
                                  {match.displayName || "Match"}
                                </h3>
                                {match.unreadCount && match.unreadCount > 0 && (
                                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2.5 py-0.5 animate-pulse">
                                    {match.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isExpiringSoon && !matchExpired && (
                                  <Badge variant="destructive" className="text-xs animate-pulse">
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
                            
                            {/* Venue Info - PROMINENT */}
                            {match.venueName && (
                              <div className="flex items-center gap-2 mb-2.5 px-2.5 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
                                <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                <span className="text-sm font-semibold text-indigo-700">
                                  {match.venueName}
                                </span>
                                <span className="text-xs text-indigo-500">• Met here</span>
                              </div>
                            )}
                            
                            {/* Last Message Preview */}
                            <div className="flex items-center gap-2 mb-2">
                              {match.lastMessage ? (
                                <>
                                  <MessageCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
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
                            {matchExpired ? (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs text-neutral-400 border-neutral-300">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Expired - Check in to reactivate
                                </Badge>
                              </div>
                            ) : !isExpiringSoon && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-300 bg-indigo-50/50">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {remainingTime} left
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-5 h-5 text-indigo-400 flex-shrink-0" />
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
