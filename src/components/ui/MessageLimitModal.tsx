/**
 * Message Limit Modal
 * Shows when user reaches message limit with upgrade option
 * Note: Premium is NOT available in beta, so this shows "coming soon"
 */

import { X } from "lucide-react";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isLimitReached ? "Make Plans to Meet Up" : "Chat to Coordinate Meeting"}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {isLimitReached ? (
              <>
                You've sent all your messages for this match. To continue chatting, you can:
                <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                  <li>Wait for a reply from your match</li>
                  <li>Reconnect when you're both at the same venue again</li>
                </ul>
                <p className="mt-3 text-sm font-medium text-neutral-300">
                  Match active for 24 hours - make plans to meet up tonight!
                </p>
              </>
            ) : (
              <>
                You have <strong>{remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining</strong> for this match.
                <p className="mt-3 text-sm text-neutral-400">
                  Match active for 24 hours - use them to make plans to meet up in person.
                </p>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Got it
          </Button>
          {isLimitReached && (
            <Button
              onClick={() => {
                // Navigate to venues to reconnect
                navigate('/checkin');
                onClose();
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Find Venues
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

