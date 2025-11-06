import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WeMetConfirmationModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const WeMetConfirmationModal: React.FC<WeMetConfirmationModalProps> = ({ open, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogTitle>Confirm You Met</DialogTitle>
        <DialogDescription>
          Are you sure you met this person at the venue? This helps improve matches and enables reconnecting later.
        </DialogDescription>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Yes, We Met
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WeMetConfirmationModal; 