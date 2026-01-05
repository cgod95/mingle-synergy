// 🧠 Purpose: Tinder-style Matches & Messages page
// Grid of match photos + message list with previews

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Clock, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllMatches as getLocalMatches, getRemainingSeconds, isExpired, type Match, MATCH_EXPIRY_MS } from "@/lib/matchesCompat";
import { getLastMessage } from "@/lib/chatStore";
import { getLastMessageForMatch } from "@/services/messageService";
import { timeAgo } from "@/lib/timeago";
import { useAuth } from "@/context/AuthContext";
import config from "@/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MatchListSkeleton } from "@/components/ui/LoadingStates";
import { EmptyState } from "@/components/ui/EmptyState";
import { logError } from "@/utils/errorHandler";
import { matchService, userService } from "@/services";
import { FirestoreMatch } from "@/types/match";

type MatchWithPreview = Match & {
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSenderId?: string;
  isNew?: boolean;
  unreadCount?: number;
};

type TabType = 'matches' | 'messages';

export default function Matches() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchWithPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('matches');

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
          const firebaseMatches = await matchService.getMatches(currentUser.uid);
          
          allMatches = await Promise.all(firebaseMatches.map(async (fm: FirestoreMatch) => {
            const partnerId = fm.userId1 === currentUser.uid ? fm.userId2 : fm.userId1;
            
            let displayName = partnerId;
            let avatarUrl = '';
            try {
              const partnerProfile = await userService.getUserProfile(partnerId);
              if (partnerProfile) {
                displayName = partnerProfile.name || partnerId;
                avatarUrl = partnerProfile.photos?.[0] || '';
              }
            } catch {
              // Use defaults
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
          allMatches = await getLocalMatches(currentUser.uid);
        }
        
        const now = Date.now();
        const enrichedMatches: MatchWithPreview[] = await Promise.all(
          allMatches.map(async (match) => {
            let lastMessage: string | undefined;
            let lastMessageTime: number | undefined;
            let lastMessageSenderId: string | undefined;
            
            if (!config.DEMO_MODE) {
              const lastMsgInfo = await getLastMessageForMatch(match.id);
              if (lastMsgInfo) {
                lastMessage = lastMsgInfo.text;
                lastMessageTime = lastMsgInfo.createdAt.getTime();
                lastMessageSenderId = lastMsgInfo.senderId;
              }
            } else {
              const lastMsg = getLastMessage(match.id);
              if (lastMsg) {
                lastMessage = lastMsg.text;
                lastMessageTime = lastMsg.ts;
                lastMessageSenderId = lastMsg.sender === 'me' ? currentUser?.uid : match.partnerId;
              }
            }
            
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

        enrichedMatches.sort((a, b) => {
          if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime - a.lastMessageTime;
          }
          if (a.lastMessageTime) return -1;
          if (b.lastMessageTime) return 1;
          return b.createdAt - a.createdAt;
        });

        setMatches(enrichedMatches);
      } catch (error) {
        logError(error as Error, { context: 'Matches.fetchMatches', userId: currentUser?.uid || 'unknown' });
        try {
          const localMatches = await getLocalMatches(currentUser.uid);
          setMatches(localMatches.map(m => ({ ...m, isNew: false })));
        } catch {
          // Show empty state
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [currentUser?.uid]);

  // Filter active matches only
  const activeMatches = useMemo(() => 
    matches.filter(m => !isExpired(m)), 
    [matches]
  );

  // Matches with conversations (have messages)
  const matchesWithMessages = useMemo(() => 
    activeMatches.filter(m => m.lastMessage),
    [activeMatches]
  );

  // New matches (no messages yet)
  const newMatches = useMemo(() => 
    activeMatches.filter(m => !m.lastMessage),
    [activeMatches]
  );

  const handleMatchClick = (matchId: string) => {
    navigate(`/chat/${matchId}`);
  };

  const formatTime = (expiresAt: number): string => {
    const remaining = getRemainingSeconds({ expiresAt } as Match);
    if (remaining === 0) return "Expired";
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0a0f] pb-20">
        {/* Header with Tabs */}
        <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-0">
            {/* Tabs */}
            <div className="flex">
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex-1 pb-4 text-center font-semibold text-lg transition-all relative ${
                  activeTab === 'matches' 
                    ? 'text-white' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Matches
                {activeMatches.length > 0 && (
                  <span className="ml-2 text-sm text-[#7C3AED]">
                    {activeMatches.length}
                  </span>
                )}
                {activeTab === 'matches' && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 pb-4 text-center font-semibold text-lg transition-all relative ${
                  activeTab === 'messages' 
                    ? 'text-white' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Messages
                {matchesWithMessages.length > 0 && (
                  <span className="ml-2 text-sm text-[#7C3AED]">
                    {matchesWithMessages.length}
                  </span>
                )}
                {activeTab === 'messages' && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]"
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="px-4 py-6">
              <MatchListSkeleton />
            </div>
          ) : matches.length === 0 ? (
            <div className="px-4 py-12">
              <EmptyState
                icon={Heart}
                title="No matches yet"
                description="Check into a venue to start meeting people"
                action={{
                  label: "Find a venue",
                  onClick: () => navigate('/checkin')
                }}
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'matches' ? (
                <motion.div
                  key="matches-grid"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  {/* Matches Grid */}
                  {activeMatches.length === 0 ? (
                    <EmptyState
                      icon={Sparkles}
                      title="No active matches"
                      description="Your matches have expired. Check in to meet more people!"
                      action={{
                        label: "Find a venue",
                        onClick: () => navigate('/checkin')
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {/* Likes Sent Tile */}
                      <div 
                        className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#6D28D9]/30 border border-[#7C3AED]/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#7C3AED]/50 transition-all group"
                        onClick={() => navigate('/checkin')}
                      >
                        <div className="w-12 h-12 rounded-full bg-[#7C3AED]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Heart className="w-6 h-6 text-[#7C3AED]" />
                        </div>
                        <span className="text-xs text-[#A78BFA] font-medium">Likes Sent</span>
                      </div>

                      {/* Match Photos */}
                      {activeMatches.map((match) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group"
                          onClick={() => handleMatchClick(match.id)}
                        >
                          {/* Photo */}
                          {match.avatarUrl ? (
                            <img 
                              src={match.avatarUrl} 
                              alt={match.displayName || 'Match'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center">
                              <span className="text-4xl font-bold text-white">
                                {(match.displayName || 'M').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Name & Timer */}
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white font-semibold text-sm truncate">
                              {match.displayName?.split(' ')[0] || 'Match'}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span className="text-xs text-neutral-400">
                                {formatTime(match.expiresAt)}
                              </span>
                            </div>
                          </div>

                          {/* New Badge */}
                          {match.isNew && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-0.5 bg-[#7C3AED] text-white text-xs font-semibold rounded-full">
                                NEW
                              </span>
                            </div>
                          )}

                          {/* Unread indicator */}
                          {!match.lastMessage && !match.isNew && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-[#7C3AED] rounded-full border-2 border-[#0a0a0f]" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="messages-list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Messages List */}
                  {matchesWithMessages.length === 0 ? (
                    <div className="px-4 py-12">
                      <EmptyState
                        icon={MessageCircle}
                        title="No messages yet"
                        description="Start a conversation with one of your matches!"
                        action={{
                          label: "View matches",
                          onClick: () => setActiveTab('matches')
                        }}
                      />
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {matchesWithMessages.map((match) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors active:bg-white/10"
                          onClick={() => handleMatchClick(match.id)}
                        >
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-14 w-14 ring-2 ring-[#1a1a24] ring-offset-0">
                              {match.avatarUrl ? (
                                <AvatarImage 
                                  src={match.avatarUrl} 
                                  alt={match.displayName || "Match"}
                                  className="object-cover"
                                />
                              ) : null}
                              <AvatarFallback className="bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white font-bold text-lg">
                                {(match.displayName || "M").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online/Timer indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.5 bg-[#1a1a24] rounded-full">
                              <span className="text-[10px] text-neutral-400 font-medium">
                                {formatTime(match.expiresAt)}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h3 className="font-semibold text-white truncate">
                                {match.displayName || "Match"}
                              </h3>
                              {match.lastMessageTime && (
                                <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">
                                  {timeAgo(match.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-400 truncate">
                              {match.lastMessageSenderId === currentUser?.uid && (
                                <span className="text-neutral-500">You: </span>
                              )}
                              {match.lastMessage}
                            </p>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-5 h-5 text-neutral-600 flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
        
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}
