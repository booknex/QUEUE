import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueueItem } from "@/components/QueueItem";
import type { ClientFile, Pipeline } from "@shared/schema";
import { FileText } from "lucide-react";

interface ClosedFilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: ClientFile[];
  pipelines: Pipeline[];
  onTouch: (file: ClientFile) => void;
  onEdit: (file: ClientFile) => void;
  onDelete: (id: number) => void;
  onClose: (file: ClientFile) => void;
  now: number;
}

export function ClosedFilesModal({
  open,
  onOpenChange,
  files,
  pipelines,
  onTouch,
  onEdit,
  onDelete,
  onClose,
  now,
}: ClosedFilesModalProps) {
  const closedFiles = files.filter(f => f.closedAt !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh]" data-testid="dialog-closed-files">
        <DialogHeader>
          <DialogTitle>Completed Clients</DialogTitle>
          <DialogDescription>
            View all completed client files
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-x-auto overflow-y-visible pb-4 -mx-6 px-6">
          {closedFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No closed files yet</p>
            </div>
          ) : (
            <div className="flex gap-4 min-w-max" data-testid="closed-queue-list">
              {closedFiles.map((file) => (
                <QueueItem
                  key={file.id}
                  file={file}
                  pipelines={pipelines}
                  onTouch={onTouch}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClose={onClose}
                  now={now}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
