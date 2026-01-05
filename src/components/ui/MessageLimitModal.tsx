// MessageLimitModal - Dark theme with brand purple

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MessageLimitModalProps {
  open: boolean;
  onClose: () => void;
  remainingMessages: number;
}

export default function MessageLimitModal({
  open,
  onClose,
  remainingMessages,
}: MessageLimitModalProps) {
  const navigate = useNavigate();
  const isLimitReached = remainingMessages === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#111118] border-[#2D2D3A]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {isLimitReached ? "Make Plans to Meet Up" : "Chat to Coordinate Meeting"}
          </DialogTitle>
          <DialogDescription className="pt-2 text-[#9CA3AF]">
            {isLimitReached ? (
              <>
                You've sent all your messages for this match. To continue chatting, you can:
                <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                  <li>Wait for a reply from your match</li>
                  <li>Reconnect when you're both at the same venue again</li>
                </ul>
                <p className="mt-3 text-sm font-medium text-[#E5E5E5]">
                  Match active for 24 hours - make plans to meet up tonight!
                </p>
              </>
            ) : (
              <>
                You have <strong className="text-white">{remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining</strong> for this match.
                <p className="mt-3 text-sm text-[#6B7280]">
                  Match active for 24 hours - use them to make plans to meet up in person.
                </p>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1 border-[#2D2D3A] text-[#9CA3AF] hover:bg-[#1a1a24] hover:text-white"
          >
            Got it
          </Button>
          {isLimitReached && (
            <Button
              onClick={() => {
                navigate('/checkin');
                onClose();
              }}
              className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white"
            >
              Find Venues
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
