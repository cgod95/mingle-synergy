// src/components/MatchCard.tsx
import React, { useState } from "react";
import { DisplayMatch } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, confirmWeMet } from "@/services/firebase/matchService";
import WeMetConfirmationModal from "@/components/WeMetConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, MapPin, Clock, Star, User } from 'lucide-react';
import logger from '@/utils/Logger';

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
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showWeMetModal, setShowWeMetModal] = useState(false);
  const [weMetStatus, setWeMetStatus] = useState<"idle" | "confirming" | "confirmed" | "error">("idle");

  const handleSendMessage = async () => {
    if (!currentUser || !message.trim()) return;
    setStatus("sending");

    try {
      await sendMessage(match.id, currentUser.uid, message.trim());
      setMessage("");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      logger.error("Error sending message:", err);
      setStatus("error");
    }
  };

  const handleWeMetConfirm = async () => {
    if (!currentUser) return;
    
    if (onWeMetClick) {
      onWeMetClick(match.id);
      setShowWeMetModal(false);
    } else {
      setWeMetStatus("confirming");
      
      try {
        await confirmWeMet(match.id, currentUser.uid);
        setWeMetStatus("confirmed");
        setShowWeMetModal(false);
        setTimeout(() => setWeMetStatus("idle"), 2000);
      } catch (err) {
        logger.error("Error confirming we met:", err);
        setWeMetStatus("error");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="w-full"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
        {/* Large Profile Image Section */}
        <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full cursor-pointer"
            onClick={() => onViewProfile(match.id)}
          >
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage 
                src={match.photoUrl} 
                alt={match.name}
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="w-full h-full text-4xl bg-gradient-to-br from-pink-200 to-purple-200">
                {match.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          {/* Online Status Indicator */}
          {match.isOnline && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"
            />
          )}
          
          {/* Age Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-white/90 text-gray-800 font-semibold px-3 py-1">
              {match.age}
            </Badge>
          </div>
          
          {/* Distance Badge */}
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white font-semibold px-3 py-1">
              <MapPin className="w-3 h-3 mr-1" />
              {match.distance}km
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Name and Basic Info */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-2xl text-gray-800">{match.name}</h3>
              {isRematch && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  <Star className="w-3 h-3 mr-1" />
                  Rematch
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{match.venue?.name || 'Unknown venue'}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Matched {match.matchedAt}</span>
            </div>
          </div>

          {/* Last Message Preview */}
          {match.lastMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 p-3 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-700 line-clamp-2 font-medium">
                "{match.lastMessage.content}"
              </p>
            </motion.div>
          )}

          {/* Mutual Interests */}
          {match.mutualInterests && match.mutualInterests.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Mutual Interests</h4>
              <div className="flex flex-wrap gap-2">
                {match.mutualInterests.slice(0, 4).map((interest, idx) => (
                  <motion.div
                    key={interest}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                  >
                    <Badge className="bg-pink-100 text-pink-800 border-pink-200 font-medium">
                      {interest}
                    </Badge>
                  </motion.div>
                ))}
                {match.mutualInterests.length > 4 && (
                  <Badge variant="outline" className="text-gray-600">
                    +{match.mutualInterests.length - 4} more
                  </Badge>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onViewProfile(match.id)}
                className="flex-1 h-12 font-semibold border-2 hover:bg-gray-50"
              >
                <User className="w-5 h-5 mr-2" />
                Profile
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => onSendMessage(match.id)}
                className="flex-1 h-12 font-semibold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message
              </Button>
            </motion.div>
          </div>
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
