// src/components/MatchCard.tsx
import React, { useState } from "react";
import { DisplayMatch } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, confirmWeMet } from "@/services/firebase/matchService";
import WeMetConfirmationModal from "@/components/WeMetConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, MapPin, Clock, Sparkles, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BlockReportDialog } from '@/components/BlockReportDialog';

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
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Get other user ID for block/report (match.id is the match ID, need to extract user ID)
  // In a real implementation, match would have userId or partnerId
  const otherUserId = match.id; // Placeholder - would need to fetch from match data

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
    <div className="w-full">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-neutral-700 hover:border-indigo-500 hover:-translate-y-1 bg-neutral-800">
        <CardHeader className="pb-4 bg-neutral-800/50">
          <div className="flex items-center space-x-4">
            <div className="relative transition-transform hover:scale-105 active:scale-95">
              <Avatar className="h-20 w-20 cursor-pointer ring-2 ring-indigo-500/50 shadow-lg" onClick={() => onViewProfile(match.id)}>
                <AvatarImage 
                  src={match.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"} 
                  alt={match.name} 
                  className="object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";
                  }}
                />
                <AvatarFallback className="bg-indigo-600 text-white text-xl font-semibold">
                  {match.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {match.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              )}
              {isRematch && (
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-indigo-600 text-white text-xs px-2 py-0.5">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Rematch
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-xl truncate text-white">
                  {match.name}
                </h3>
                <Badge variant="outline" className="text-xs font-medium">
                  {match.age}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-neutral-400 mb-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span className="truncate font-medium">{match.venue?.name || 'Unknown venue'}</span>
              </div>
              
              {match.distance && (
                <div className="flex items-center space-x-1 text-xs text-neutral-500">
                  <span>{match.distance}km away</span>
                </div>
              )}
            </div>
            {/* Block/Report Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                  <span className="text-red-600">Block User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                  <span>Report User</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4">
          {match.lastMessage && (
            <div className="mb-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
              <div className="flex items-start space-x-2">
                <MessageCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-neutral-300 line-clamp-2 font-medium">
                  {match.lastMessage.content}
                </p>
              </div>
            </div>
          )}

          {match.mutualInterests && match.mutualInterests.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">Common Interests</p>
              <div className="flex flex-wrap gap-2">
                {match.mutualInterests.slice(0, 3).map((interest, idx) => (
                  <div key={interest} className="transition-transform hover:scale-105">
                    <Badge className="bg-indigo-600 text-white text-xs px-3 py-1 shadow-sm">
                      {interest}
                    </Badge>
                  </div>
                ))}
                {match.mutualInterests.length > 3 && (
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    +{match.mutualInterests.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <div className="flex-1 transition-transform hover:scale-105 active:scale-95">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(match.id)}
                className="w-full border-2 border-neutral-600 hover:border-indigo-500 hover:bg-indigo-900/30 text-neutral-300 transition-all"
              >
                View Profile
              </Button>
            </div>
            
            <div className="flex-1 transition-transform hover:scale-105 active:scale-95">
              <Button
                size="sm"
                onClick={() => onSendMessage(match.id)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
          
          {match.matchedAt && (
            <div className="mt-3 pt-3 border-t border-neutral-700">
              <div className="flex items-center justify-center space-x-1 text-xs text-neutral-400">
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

      {/* Block/Report Dialogs */}
      {otherUserId && (
        <>
          <BlockReportDialog
            userId={otherUserId}
            userName={match.name}
            open={showBlockDialog}
            onClose={() => setShowBlockDialog(false)}
            type="block"
          />
          <BlockReportDialog
            userId={otherUserId}
            userName={match.name}
            open={showReportDialog}
            onClose={() => setShowReportDialog(false)}
            type="report"
          />
        </>
      )}
    </div>
  );
};

export default MatchCard;
