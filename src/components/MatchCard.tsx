// MatchCard - Dark theme with brand purple

import React, { useState } from "react";
import { DisplayMatch } from "@/types/match";
import { useAuth } from "@/context/AuthContext";
import { confirmWeMet } from "@/services/firebase/matchService";
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

  const otherUserId = match.id;

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
        console.error("Error confirming we met:", err);
        setWeMetStatus("error");
      }
    }
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#2D2D3A] bg-[#111118] hover:border-[#7C3AED]/50">
        <CardHeader className="pb-4 bg-gradient-to-r from-[#7C3AED]/10 to-[#6D28D9]/5">
          <div className="flex items-center space-x-4">
            <div className="relative transition-transform hover:scale-105 active:scale-95">
              <Avatar className="h-20 w-20 cursor-pointer ring-2 ring-[#7C3AED]/50 shadow-lg" onClick={() => onViewProfile(match.id)}>
                <AvatarImage 
                  src={match.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"} 
                  alt={match.name} 
                  className="object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop";
                  }}
                />
                <AvatarFallback className="bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white text-xl font-semibold">
                  {match.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {match.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111118] shadow-sm" />
              )}
              {isRematch && (
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-[#7C3AED] text-white text-xs px-2 py-0.5">
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
                <Badge variant="outline" className="text-xs font-medium border-[#2D2D3A] text-[#9CA3AF]">
                  {match.age}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-[#9CA3AF] mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span className="truncate font-medium">{match.venue?.name || 'Unknown venue'}</span>
              </div>
              
              {match.distance && (
                <div className="flex items-center space-x-1 text-xs text-[#6B7280]">
                  <span>{match.distance}km away</span>
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-[#6B7280] hover:text-white hover:bg-[#1a1a24]">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#111118] border-[#2D2D3A]">
                <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="hover:bg-[#1a1a24]">
                  <span className="text-red-400">Block User</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="hover:bg-[#1a1a24] text-[#9CA3AF]">
                  <span>Report User</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4">
          {match.lastMessage && (
            <div className="mb-4 p-3 bg-[#7C3AED]/10 rounded-lg border border-[#7C3AED]/20">
              <div className="flex items-start space-x-2">
                <MessageCircle className="w-4 h-4 text-[#A78BFA] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#E5E5E5] line-clamp-2 font-medium">
                  {match.lastMessage.content}
                </p>
              </div>
            </div>
          )}

          {match.mutualInterests && match.mutualInterests.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#6B7280] mb-2 uppercase tracking-wide">Common Interests</p>
              <div className="flex flex-wrap gap-2">
                {match.mutualInterests.slice(0, 3).map((interest, idx) => (
                  <div key={interest} className="transition-transform hover:scale-105">
                    <Badge className="bg-[#7C3AED] text-white text-xs px-3 py-1 shadow-sm">
                      {interest}
                    </Badge>
                  </div>
                ))}
                {match.mutualInterests.length > 3 && (
                  <Badge variant="outline" className="text-xs px-3 py-1 border-[#2D2D3A] text-[#9CA3AF]">
                    +{match.mutualInterests.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <div className="flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(match.id)}
                className="w-full border-[#2D2D3A] text-[#9CA3AF] hover:border-[#7C3AED]/50 hover:bg-[#1a1a24] hover:text-white"
              >
                View Profile
              </Button>
            </div>
            
            <div className="flex-1">
              <Button
                size="sm"
                onClick={() => onSendMessage(match.id)}
                className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/25"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
          
          {match.matchedAt && (
            <div className="mt-3 pt-3 border-t border-[#2D2D3A]">
              <div className="flex items-center justify-center space-x-1 text-xs text-[#6B7280]">
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
