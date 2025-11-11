/**
 * Message Limit Modal
 * Shows when user reaches message limit with upgrade option
 * Note: Premium is NOT available in beta, so this shows "coming soon"
 */

import { X } from "lucide-react";
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
  const isLimitReached = remainingMessages === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isLimitReached ? "Message Limit Reached" : "Message Limit Remaining"}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {isLimitReached ? (
              <>
                You've sent all 5 messages for this match. To continue chatting, you can:
                <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                  <li>Wait for a reply from your match</li>
                  <li>Reconnect when you're both at the same venue again</li>
                </ul>
              </>
            ) : (
              <>
                You have <strong>{remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining</strong> for this match.
                <p className="mt-3 text-sm text-neutral-600">
                  Make them count! Focus on meeting up in person.
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
                window.location.href = '/checkin';
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

