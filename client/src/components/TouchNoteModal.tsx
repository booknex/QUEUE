import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ClientFile } from "@shared/schema";

interface TouchNoteModalProps {
  file: ClientFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (note: string) => void;
}

export function TouchNoteModal({ file, open, onOpenChange, onSubmit }: TouchNoteModalProps) {
  const [note, setNote] = useState("");

  // Reset note state when modal closes
  useEffect(() => {
    if (!open) {
      setNote("");
    }
  }, [open]);

  // Reset note state when file changes
  useEffect(() => {
    setNote("");
  }, [file?.id]);

  const handleSubmit = () => {
    onSubmit(note);
    setNote("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]" 
        data-testid="dialog-touch-note"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Touch File</DialogTitle>
          <DialogDescription>
            Add a note for <span className="font-semibold">{file?.clientName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="What did you work on? Any updates or observations..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px] resize-none"
              data-testid="input-touch-note"
            />
            <p className="text-xs text-muted-foreground">
              This note will be saved in the file's history
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-touch"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            data-testid="button-submit-touch"
          >
            Touch File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
