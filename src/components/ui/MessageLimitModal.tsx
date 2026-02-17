/**
 * Message Limit Modal
 * Shows when user reaches message limit with reconnect/premium options
 */

import { X, RefreshCw, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
      <DialogContent className="sm:max-w-sm bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white text-center">
            {isLimitReached ? "Continue the conversation?" : `${remainingMessages} messages left`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 pt-2">
          {isLimitReached ? (
            <>
              <p className="text-sm text-neutral-400 text-center">
                You've used all your messages. Here's how to keep chatting:
              </p>
              
              {/* Request to continue */}
              <button
                onClick={() => {
                  // TODO: Implement request-to-continue signal
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 transition-colors text-left"
              >
                <RefreshCw className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Request to continue</p>
                  <p className="text-xs text-neutral-400">Ask your match to keep chatting</p>
                </div>
              </button>

              {/* Premium unlock */}
              <button
                onClick={() => {
                  navigate('/billing');
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors text-left"
              >
                <Crown className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Unlimited messages</p>
                  <p className="text-xs text-neutral-500">Coming soon with Premium</p>
                </div>
              </button>

              {/* Find venues */}
              <button
                onClick={() => {
                  navigate('/checkin');
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors text-left"
              >
                <RefreshCw className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Meet at a venue</p>
                  <p className="text-xs text-neutral-500">Reconnect in person to unlock more messages</p>
                </div>
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-400 text-center">
                Use your remaining messages to make plans to meet up in person.
              </p>
              <Button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                Got it
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
