// 🧠 Purpose: Unified Matches & Chats page - like dating apps
// Shows all matches with last message preview and avatar

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Clock, ArrowRight, MapPin, Filter, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllMatches as getLocalMatches, getRemainingSeconds, isExpired, type Match, MATCH_EXPIRY_MS } from "@/lib/matchesCompat";
import { getLastMessage } from "@/lib/chatStore";
import { getLastMessageForMatch, LastMessageInfo } from "@/services/messageService";
import { timeAgo } from "@/lib/timeago";
import { useAuth } from "@/context/AuthContext";
import config from "@/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MatchListSkeleton } from "@/components/ui/LoadingStates";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { Search, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { logError } from "@/utils/errorHandler";
import { matchService, userService } from "@/services";
import { FirestoreMatch } from "@/types/match";
import ReconnectButton from "@/components/ReconnectButton";

// Animation variants for staggered list
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

type MatchWithPreview = Match & {
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSenderId?: string; // To determine "You:" or "Name:" prefix
  isNew?: boolean;
};

type FilterType = 'all' | 'active' | 'expired';

export default function Matches() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentUser?.uid) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        let allMatches: Match[] = [];
        
        if (!config.DEMO_MODE) {
          // Production: Get matches from Firebase
          const firebaseMatches = await matchService.getMatches(currentUser.uid);
          
          // Transform Firebase matches to local Match format
          allMatches = await Promise.all(firebaseMatches.map(async (fm: FirestoreMatch) => {
            const partnerId = fm.userId1 === currentUser.uid ? fm.userId2 : fm.userId1;
            
            // Try to get partner's profile
            let displayName = partnerId;
            let avatarUrl = '';
            try {
              const partnerProfile = await userService.getUserProfile(partnerId);
              if (partnerProfile) {
                displayName = partnerProfile.name || partnerId;
                avatarUrl = partnerProfile.photos?.[0] || partnerProfile.photoURL || '';
              }
            } catch {
              // Use defaults if profile fetch fails
            }
            
            return {
              id: fm.id || `match_${partnerId}`,
              userId: currentUser.uid,
              partnerId,
              createdAt: fm.timestamp,
              expiresAt: fm.timestamp + MATCH_EXPIRY_MS,
              displayName,
              avatarUrl,
              venueName: fm.venueName,
              venueId: fm.venueId,
            } as Match;
          }));
        } else {
          // Demo mode: Use local storage
          allMatches = await getLocalMatches(currentUser.uid);
        }
        
        // Enrich with last message preview and new match indicator
        const now = Date.now();
        const enrichedMatches: MatchWithPreview[] = await Promise.all(
          allMatches.map(async (match) => {
            let lastMessage: string | undefined;
            let lastMessageTime: number | undefined;
            let lastMessageSenderId: string | undefined;
            
            if (!config.DEMO_MODE) {
              // Production: Fetch last message from Firebase
              console.log('[Matches] Fetching last message for match:', match.id);
              const lastMsgInfo = await getLastMessageForMatch(match.id);
              console.log('[Matches] Last message result for match', match.id, ':', lastMsgInfo);
              if (lastMsgInfo) {
                lastMessage = lastMsgInfo.text;
                lastMessageTime = lastMsgInfo.createdAt.getTime();
                lastMessageSenderId = lastMsgInfo.senderId;
              }
            } else {
              // Demo mode: Use localStorage
              const lastMsg = getLastMessage(match.id);
              if (lastMsg) {
                lastMessage = lastMsg.text;
                lastMessageTime = lastMsg.ts;
                // In demo mode, 'me' = currentUser, 'them' = other user
                lastMessageSenderId = lastMsg.sender === 'me' ? currentUser?.uid : match.partnerId;
              }
            }
            
            // Consider match "new" if created within last hour and no messages yet
            const isNew = !lastMessage && (now - match.createdAt < 60 * 60 * 1000);
            
            return {
              ...match,
              lastMessage,
              lastMessageTime,
              lastMessageSenderId,
              isNew,
            };
          })
        );

        // Sort by last message time (most recent first), then by expiry (soonest first)
        enrichedMatches.sort((a, b) => {
          if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime - a.lastMessageTime;
          }
          if (a.lastMessageTime) return -1;
          if (b.lastMessageTime) return 1;
          return a.expiresAt - b.expiresAt; // Soonest expiry first
        });

        // Only update state if data actually changed (prevents flickering)
        setMatches(prev => {
          // Compare all relevant fields to prevent unnecessary re-renders
          const prevJson = JSON.stringify(prev.map(m => ({ 
            id: m.id, 
            lastMessage: m.lastMessage, 
            lastMessageTime: m.lastMessageTime,
            isNew: m.isNew,
            displayName: m.displayName
          })));
          const nextJson = JSON.stringify(enrichedMatches.map(m => ({ 
            id: m.id, 
            lastMessage: m.lastMessage, 
            lastMessageTime: m.lastMessageTime,
            isNew: m.isNew,
            displayName: m.displayName
          })));
          if (prevJson === nextJson) {
            return prev; // No change, don't trigger re-render
          }
          return enrichedMatches;
        });
      } catch (error) {
        logError(error as Error, { context: 'Matches.fetchMatches', userId: currentUser?.uid || 'unknown' });
        
        // Fallback to local matches on error
        try {
          const localMatches = await getLocalMatches(currentUser.uid);
          setMatches(localMatches.map(m => ({ ...m, isNew: false })));
        } catch {
          // Complete failure - show empty state
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
    // Refresh every 60 seconds to reduce flickering while still keeping data fresh
    // Firebase subscriptions handle real-time updates for critical changes
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [currentUser?.uid]); // CRITICAL: Only depend on user ID, not whole object


  const formatRemainingTime = (expiresAt: number): string => {
    const remaining = getRemainingSeconds({ expiresAt } as Match);
    if (remaining === 0) return "Expired";
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get expiry color based on remaining time
  const getExpiryColor = (remainingSeconds: number): string => {
    if (remainingSeconds < 30 * 60) return 'text-red-400 border-red-500 bg-red-900/30'; // < 30 min - red
    if (remainingSeconds < 60 * 60) return 'text-orange-400 border-orange-500 bg-orange-900/30'; // < 1 hour - orange
    return 'text-green-400 border-green-500 bg-green-900/20'; // > 1 hour - green
  };

  const handleMatchClick = (matchId: string) => {
    navigate(`/chat/${matchId}`);
  };

  // Filter matches based on selected filter and search - memoized to prevent recalculation
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Filter by search query first
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (match.displayName || '').toLowerCase();
        const venue = (match.venueName || '').toLowerCase();
        const message = (match.lastMessage || '').toLowerCase();
        if (!name.includes(query) && !venue.includes(query) && !message.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [matches, searchQuery]);

  // Separate active and expired matches based on filter - memoized
  const activeMatchesList = useMemo(() => {
    return filteredMatches.filter(m => {
      if (filter === 'expired') return false;
      return !isExpired(m);
    });
  }, [filteredMatches, filter]);
  
  const expiredMatchesList = useMemo(() => {
    return filteredMatches.filter(m => {
      if (filter === 'active') return false;
      return isExpired(m);
    });
  }, [filteredMatches, filter]);

  // Calculate stats - memoized
  const { activeMatches, expiredMatches, totalMatches } = useMemo(() => ({
    activeMatches: matches.filter(m => !isExpired(m)).length,
    expiredMatches: matches.filter(m => isExpired(m)).length,
    totalMatches: matches.length
  }), [matches]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Matches
                </h1>
                <p className="text-neutral-300 mt-2">Your conversations</p>
              </div>
              {totalMatches > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-600 text-white px-4 py-1.5 text-sm font-semibold shadow-lg">
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    {activeMatches} active
                  </Badge>
                </div>
              )}
            </div>

            {/* Search and Filter */}
            {totalMatches > 0 && (
              <div className="space-y-3 mb-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    aria-label="Search matches by name"
                  />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-neutral-400" />
                  <div className="flex gap-2">
                    {(['all', 'active', 'expired'] as FilterType[]).map((filterType) => (
                      <Button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        variant={filter === filterType ? 'default' : 'outline'}
                        size="sm"
                        className={
                          filter === filterType
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-[0_0_8px_rgba(99,102,241,0.4)] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900'
                            : 'border-neutral-600 text-neutral-300 hover:bg-neutral-800 bg-neutral-800/50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900'
                        }
                        aria-label={`Filter ${filterType} matches`}
                      >
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              )}
          </div>

          {isLoading ? (
            <MatchListSkeleton />
          ) : matches.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No matches yet"
              description="Check into a venue to start meeting people"
              action={{
                label: "Check into a venue to start matching",
                onClick: () => navigate('/checkin')
              }}
            />
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Active Matches */}
              {activeMatchesList.length > 0 && (
                <div className="space-y-3">
                  {activeMatchesList.map((match, index) => {
                  const remainingSeconds = getRemainingSeconds(match);
                  const remainingTime = formatRemainingTime(match.expiresAt);
                  const isExpiringSoon = remainingSeconds < 30 * 60; // Less than 30 minutes
                  const isExpiringVerySoon = remainingSeconds < 15 * 60; // Less than 15 minutes
                  const matchExpired = isExpired(match);
                  const expiryColor = getExpiryColor(remainingSeconds);
                  
                  return (
                    <motion.div key={match.id} variants={itemVariants}>
                      <Card
                        className={`cursor-pointer transition-all border overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900 ${
                          matchExpired
                            ? "opacity-60 border-neutral-700 bg-neutral-800/50"
                            : isExpiringVerySoon
                            ? "border-red-500 bg-red-900/10 hover:shadow-lg hover:border-red-400"
                            : isExpiringSoon
                            ? "border-orange-500 bg-orange-900/10 hover:shadow-lg hover:border-orange-400"
                            : "border-neutral-700 bg-neutral-800 hover:shadow-xl hover:border-indigo-500"
                        }`}
                        onClick={() => handleMatchClick(match.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleMatchClick(match.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Match with ${match.displayName || 'Match'}`}
                      >
                        <div className="flex items-center gap-4 px-4 py-4 md:px-6 md:py-6">
                          {/* Avatar - Enhanced with unread indicator */}
                          <div className="relative flex-shrink-0">
                            <Avatar className={`h-20 w-20 flex-shrink-0 ring-2 ring-offset-2 ring-offset-neutral-800 ${
                              match.unreadCount && match.unreadCount > 0 
                                ? 'ring-indigo-500' 
                                : 'ring-neutral-600'
                            }`}>
                            {match.avatarUrl ? (
                              <AvatarImage 
                                src={match.avatarUrl} 
                                alt={match.displayName || "Match"}
                              />
                            ) : null}
                            <AvatarFallback className="bg-indigo-600 text-white font-bold text-2xl">
                              {(match.displayName || "M").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                            {match.unreadCount && match.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-neutral-800">
                                <span className="text-xs font-bold text-white">{match.unreadCount}</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <h3 className={`font-bold text-xl truncate ${
                                  match.unreadCount && match.unreadCount > 0 
                                    ? 'text-white' 
                                    : 'text-neutral-200'
                                }`}>
                                  {match.displayName || "Match"}
                                </h3>
                                {match.isNew && (
                                  <Badge className="bg-purple-600 text-white text-xs px-2 py-0.5 shadow-lg">
                                    <Star className="w-3 h-3 mr-1" />
                                    New
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {!matchExpired && (
                                  <Badge className={`text-xs border ${expiryColor} ${
                                    isExpiringVerySoon ? 'animate-pulse' : ''
                                  }`}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {remainingTime}
                                  </Badge>
                                )}
                                {match.lastMessageTime && (
                                  <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">
                                  {timeAgo(match.lastMessageTime)}
                                </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Last Message Preview - PRIORITIZED */}
                            {match.lastMessage ? (
                              <div className="mb-2">
                                <p className={`text-sm line-clamp-2 ${
                                  match.unreadCount && match.unreadCount > 0
                                    ? 'text-white font-semibold'
                                    : 'text-neutral-300 font-medium'
                                }`}>
                                  <span className="text-neutral-400 font-normal">
                                    {match.lastMessageSenderId === currentUser?.uid ? 'You: ' : `${match.displayName?.split(' ')[0] || 'Them'}: `}
                                  </span>
                                  {match.lastMessage}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-neutral-400 italic mb-2">
                                Start the conversation...
                              </p>
                            )}
                            
                            {/* Venue Info - SECONDARY - Reduced weight */}
                            {match.venueName && (
                              <div className="inline-flex items-center gap-1.5 mb-2 px-2 py-1 bg-indigo-900/10 rounded-md border border-indigo-700/30">
                                <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                                <span className="text-xs text-indigo-300/80">
                                  Met at {match.venueName}
                                </span>
                              </div>
                            )}

                            {/* Time Remaining Badge - Only show if expired (active matches show timer in header row) */}
                            {matchExpired && (
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs text-neutral-500 border-neutral-600 bg-neutral-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Expired
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/checkin');
                                  }}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 h-6 px-2"
                                >
                                  Reactivate
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <ArrowRight className={`w-5 h-5 flex-shrink-0 ${
                            match.unreadCount && match.unreadCount > 0
                              ? 'text-indigo-400'
                              : 'text-neutral-500'
                          }`} />
                        </div>
                      </Card>
                    </motion.div>
                  );
                    })}
                </div>
              )}

              {/* Expired Matches - Collapsible (only show when filter is 'all') */}
              {filter === 'all' && expiredMatchesList.length > 0 && (
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowExpired(!showExpired)}
                    className="w-full justify-between text-neutral-400 hover:text-neutral-200"
                    aria-label={showExpired ? "Hide expired matches" : "Show expired matches"}
                  >
                    <span className="text-sm font-medium">
                      Expired ({expiredMatchesList.length})
                    </span>
                    {showExpired ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  
                  {showExpired && (
                    <>
                      {expiredMatchesList.map((match, index) => {
                        const matchExpired = true;
                        
                        return (
                          <div key={match.id}>
                            <Card
                              className="transition-all border overflow-hidden opacity-70 border-neutral-700 bg-neutral-800/50 hover:opacity-90 hover:border-neutral-600"
                            >
                              <div className="flex items-center gap-4 px-4 py-4 md:px-6 md:py-6">
                                <Avatar 
                                  className="h-20 w-20 flex-shrink-0 ring-2 ring-offset-2 ring-offset-neutral-800 ring-neutral-500 cursor-pointer grayscale hover:grayscale-0 transition-all"
                                  onClick={() => handleMatchClick(match.id)}
                                >
                                  {match.avatarUrl ? (
                                    <AvatarImage 
                                      src={match.avatarUrl} 
                                      alt={match.displayName || "Match"}
                                    />
                                  ) : null}
                                  <AvatarFallback className="bg-neutral-600 text-white font-bold text-2xl">
                                    {(match.displayName || "M").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 
                                      className="font-bold text-xl text-neutral-300 truncate cursor-pointer hover:text-white transition-colors"
                                      onClick={() => handleMatchClick(match.id)}
                                    >
                                      {match.displayName || "Match"}
                                    </h3>
                                    <Badge variant="outline" className="text-xs text-neutral-500 border-neutral-600 bg-neutral-800">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Expired
                                    </Badge>
                                  </div>
                                  
                                  {match.lastMessage ? (
                                    <p className="text-sm text-neutral-400 line-clamp-2 mb-2">
                                      <span className="text-neutral-500">
                                        {match.lastMessageSenderId === currentUser?.uid ? 'You: ' : `${match.displayName?.split(' ')[0] || 'Them'}: `}
                                      </span>
                                      {match.lastMessage}
                                    </p>
                                  ) : null}
                                  
                                  <div className="flex items-center gap-3 mt-2">
                                    {match.venueName && (
                                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-neutral-800/50 rounded-md border border-neutral-700/50">
                                        <MapPin className="w-3 h-3 text-neutral-500" />
                                        <span className="text-xs text-neutral-500">
                                          Met at {match.venueName}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {/* Reconnect Button for expired matches */}
                                    <ReconnectButton
                                      targetUserId={match.partnerId}
                                      variant="outline"
                                      size="sm"
                                      className="text-indigo-400 border-indigo-500/50 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-400"
                                    >
                                      <RefreshCw className="w-3 h-3 mr-1.5" />
                                      Reconnect
                                    </ReconnectButton>
                                  </div>
                                </div>

                                <ArrowRight 
                                  className="w-5 h-5 text-neutral-500 flex-shrink-0 cursor-pointer hover:text-neutral-300 transition-colors" 
                                  onClick={() => handleMatchClick(match.id)}
                                />
                              </div>
                            </Card>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}

