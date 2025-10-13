import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Users, Send, Heart } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import matchService from '@/services/firebase/matchService';
import userService from '@/services/firebase/userService';
import { useNavigate } from 'react-router-dom';
import logger from '@/utils/Logger';

interface Conversation {
  matchId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto?: string;
  venueId: string;
  lastMessage?: string;
  lastTimestamp: number;
  unreadCount: number;
}

const MessagesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe: (() => void) | undefined;

    const setup = () => {
      try {
        unsubscribe = matchService.getMatchesWithListener(currentUser.uid, async (matches) => {
          const convos: Conversation[] = await Promise.all(matches.map(async (match) => {
            const otherUserId = match.userId1 === currentUser.uid ? match.userId2 : match.userId1;
            const otherUser = await userService.getUserProfile(otherUserId);

            const sorted = [...match.messages].sort((a,b)=>b.timestamp-a.timestamp);
            const lastMsg = sorted[0];

            // unread count: messages where !readBy or not includes uid and sender not current user
            const unread = match.messages.filter(m=>m.senderId!==currentUser.uid && (!('readBy' in m) || !(m as any).readBy?.includes(currentUser.uid))).length;

            return {
              matchId: match.id,
              otherUserId,
              otherUserName: otherUser?.name || 'Unknown',
              otherUserPhoto: otherUser?.photos?.[0],
              venueId: match.venueId,
              lastMessage: lastMsg?.text,
              lastTimestamp: lastMsg?.timestamp || match.timestamp,
              unreadCount: unread,
            } as Conversation;
          }));

          // sort by lastTimestamp desc
          convos.sort((a,b)=>b.lastTimestamp - a.lastTimestamp);
          setConversations(convos);
          setLoading(false);
        });
      } catch(e) {
        logger.error('Error loading conversations', e);
        setError('Failed to load messages');
        setLoading(false);
      }
    };

    setup();
    return ()=>{ if(unsubscribe) unsubscribe(); };
  }, [currentUser]);

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff/60000);
    if(minutes<60) return `${minutes}m ago`;
    const hours = Math.floor(minutes/60);
    if(hours<24) return `${hours}h ago`;
    const days = Math.floor(hours/24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Your conversations</p>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : conversations.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="relative">
                  <MessageCircle className="w-20 h-20 text-gray-300 mx-auto" />
                  <Heart className="w-6 h-6 text-red-500 absolute -top-2 -right-8 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-gray-900">No messages yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                    Start matching with people at venues to begin conversations!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          conversations.map((conversation) => (
            <Card 
              key={conversation.matchId}
              className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 ring-2 ring-blue-100">
                      <AvatarImage
                        src={conversation.otherUserPhoto}
                        alt={`${conversation.otherUserName}'s photo`}
                      />
                      <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {conversation.otherUserName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status is not available in this mock data, so this will be removed */}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate text-lg">
                        {conversation.otherUserName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{timeAgo(conversation.lastTimestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">
                        {/* Venue is not available in this mock data, so this will be removed */}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {/* Match time is not available in this mock data, so this will be removed */}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate font-medium">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs animate-pulse">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50" onClick={()=>navigate(`/chat/${conversation.matchId}`)}>
                      <Send className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesPage; 