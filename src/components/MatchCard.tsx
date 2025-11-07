// src/components/MatchCard.tsx
import React, { useState } from "react";
import { DisplayMatch } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, confirmWeMet } from "@/services/firebase/matchService";
import WeMetConfirmationModal from "@/components/WeMetConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, MapPin, Clock } from 'lucide-react';

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
      console.error("Error sending message:", err);
      setStatus("error");
    }
  };

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
      whileHover={{ y: -2 }}
      className="w-full"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="h-12 w-12 cursor-pointer" onClick={() => onViewProfile(match.id)}>
                <AvatarImage src={match.photoUrl} alt={match.name} />
                <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg truncate">{match.name}, {match.age}</h3>
                {match.isOnline && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{match.venue?.name || 'Unknown venue'}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-1">
              <Badge variant="secondary" className="text-xs">
                {match.age} • {match.distance}km
              </Badge>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{match.matchedAt}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {match.lastMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-3"
            >
              <p className="text-sm text-muted-foreground line-clamp-2">
                {match.lastMessage.content}
              </p>
            </motion.div>
          )}

          {match.mutualInterests && match.mutualInterests.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-3"
            >
              <div className="flex flex-wrap gap-1">
                {match.mutualInterests.slice(0, 3).map((interest, idx) => (
                  <motion.div
                    key={interest}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                  >
                    <Badge variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  </motion.div>
                ))}
                {match.mutualInterests.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{match.mutualInterests.length - 3} more
                  </Badge>
                )}
              </div>
            </motion.div>
          )}

          <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(match.id)}
                className="flex-1"
              >
                View Profile
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={() => onSendMessage(match.id)}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
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
