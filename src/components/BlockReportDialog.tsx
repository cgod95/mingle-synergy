// Block/Report Dialog Component
// Per spec: Block/report anywhere you see a user with confirm dialog

import React, { useState } from 'react';
import { Ban, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { blockUser, reportUser } from '@/lib/block';
import { useAuth } from '@/context/AuthContext';
import { logError } from '@/utils/errorHandler';
import { userService } from '@/services';
import config from '@/config';

interface BlockReportDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
  type: 'block' | 'report';
}

export function BlockReportDialog({
  userId,
  userName,
  open,
  onClose,
  type,
}: BlockReportDialogProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBlock = async () => {
    if (!currentUser?.uid) return;
    
    setIsSubmitting(true);
    try {
      // Block user locally
      blockUser(userId);
      
      // Sync with Firebase in production mode
      if (!config.DEMO_MODE) {
        await userService.blockUser(currentUser.uid, userId);
      }
      
      toast({
        title: "User Blocked",
        description: `${userName} has been blocked. They can no longer see your profile or contact you.`,
        duration: 4000,
      });
      
      onClose();
    } catch (error) {
      logError(error as Error, { source: 'BlockReportDialog', action: 'blockUser', targetUserId: userId });
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!currentUser?.uid || !reportReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Report user locally
      reportUser(userId);
      
      // AUTO-BLOCK: Also block the reported user for immediate protection
      blockUser(userId);
      
      // Sync with Firebase in production mode
      if (!config.DEMO_MODE) {
        await userService.reportUser(currentUser.uid, userId, reportReason);
        // Auto-block in Firebase as well (mutual block)
        await userService.blockUser(currentUser.uid, userId);
      }
      
      toast({
        title: "Report Submitted",
        description: `Thank you for your report. ${userName} has been blocked and we'll review it within 24 hours.`,
        duration: 4000,
      });
      
      setReportReason('');
      onClose();
    } catch (error) {
      logError(error as Error, { source: 'BlockReportDialog', action: 'reportUser', targetUserId: userId });
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (type === 'block') {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Ban className="w-5 h-5 text-red-600" />
              <span>Block {userName}?</span>
            </DialogTitle>
            <DialogDescription>
              Blocking {userName} will:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Remove them from your matches and chats</li>
                <li>Prevent them from seeing your profile</li>
                <li>Stop them from contacting you</li>
                <li>Hide you from their view</li>
              </ul>
              <p className="mt-2 text-sm font-medium">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlock}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Blocking...' : 'Block User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Flag className="w-5 h-5 text-orange-600" />
            <span>Report {userName}</span>
          </DialogTitle>
          <DialogDescription>
            Help us keep Mingle safe. Please describe what happened or why you're reporting this user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the issue (e.g., inappropriate behavior, fake profile, harassment)..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleReport}
            disabled={!reportReason.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

