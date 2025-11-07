// src/components/MatchCard.tsx
import React, { useState } from "react";
import { DisplayMatch } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, confirmWeMet } from "@/services/firebase/matchService";
import WeMetConfirmationModal from "@/components/WeMetConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, MapPin, Clock, Sparkles } from 'lucide-react';

type MatchCardProps = {
  match: DisplayMatch;
  isRematch?: boolean;
  onWeMetClick?: (matchId: string) => void;
  onViewProfile: (userId: string) => void;
  onSendMessage: (matchId: string) => void;
  index?: number;
};

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  isRematch = false, 
  onWeMetClick,
  onViewProfile,
  onSendMessage,
  index = 0
}) => {
  const { currentUser } = useAuth();
  const [showWeMetModal, setShowWeMetModal] = useState(false);
  const [weMetStatus, setWeMetStatus] = useState<"idle" | "confirming" | "confirmed" | "error">("idle");

  const handleWeMetConfirm = async () => {
    if (!currentUser) return;
    
    if (onWeMetClick) {
      // Use centralized confirmation if provided
      onWeMetClick(match.id);
      setShowWeMetModal(false);
    } else {
      // Use local confirmation if no centralized handler
      setWeMetStatus("confirming");
      
      try {
        await confirmWeMet(match.id, currentUser.uid);
        setWeMetStatus("confirmed");
        setShowWeMetModal(false);
        setTimeout(() => setWeMetStatus("idle"), 2000);
      } catch (err) {
        console.error("Error confirming we met:", err);
        setWeMetStatus("error");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="w-full"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200">
        <CardHeader className="pb-4 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Avatar className="h-16 w-16 cursor-pointer ring-2 ring-white shadow-md" onClick={() => onViewProfile(match.id)}>
                <AvatarImage src={match.photoUrl} alt={match.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-lg font-semibold">
                  {match.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {match.isOnline && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"
                />
              )}
              {isRematch && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-0.5">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Rematch
                  </Badge>
                </motion.div>
              )}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-xl truncate bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {match.name}
                </h3>
                <Badge variant="outline" className="text-xs font-medium">
                  {match.age}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span className="truncate font-medium">{match.venue?.name || 'Unknown venue'}</span>
              </div>
              
              {match.distance && (
                <div className="flex items-center space-x-1 text-xs text-neutral-500">
                  <span>{match.distance}km away</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4">
          {match.lastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100"
            >
              <div className="flex items-start space-x-2">
                <MessageCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-neutral-700 line-clamp-2 font-medium">
                  {match.lastMessage.content}
                </p>
              </div>
            </motion.div>
          )}

          {match.mutualInterests && match.mutualInterests.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">Common Interests</p>
              <div className="flex flex-wrap gap-2">
                {match.mutualInterests.slice(0, 3).map((interest, idx) => (
                  <motion.div
                    key={interest}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 shadow-sm">
                      {interest}
                    </Badge>
                  </motion.div>
                ))}
                {match.mutualInterests.length > 3 && (
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    +{match.mutualInterests.length - 3} more
                  </Badge>
                )}
              </div>
            </motion.div>
          )}

          <div className="flex space-x-3 pt-2">
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(match.id)}
                className="w-full border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                View Profile
              </Button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }}
              className="flex-1"
            >
              <Button
                size="sm"
                onClick={() => onSendMessage(match.id)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </motion.div>
          </div>
          
          {match.matchedAt && (
            <div className="mt-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-center space-x-1 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                <span>Matched {match.matchedAt}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <WeMetConfirmationModal
        open={showWeMetModal}
        onConfirm={handleWeMetConfirm}
        onCancel={() => setShowWeMetModal(false)}
      />
    </motion.div>
  );
};

export default MatchCard;
