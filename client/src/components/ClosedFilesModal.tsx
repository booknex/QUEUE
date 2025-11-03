import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ClientFile } from "@shared/schema";
import { Calendar, FileText } from "lucide-react";

interface ClosedFilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: ClientFile[];
}

export function ClosedFilesModal({
  open,
  onOpenChange,
  files,
}: ClosedFilesModalProps) {
  const closedFiles = files.filter(f => f.closedAt !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]" data-testid="dialog-closed-files">
        <DialogHeader>
          <DialogTitle>Closed Files</DialogTitle>
          <DialogDescription>
            View all completed client files
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
          {closedFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No closed files yet</p>
            </div>
          ) : (
            closedFiles.map((file) => (
              <Card key={file.id} className="p-4" data-testid={`closed-file-${file.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1" data-testid={`text-client-name-${file.id}`}>
                      {file.clientName}
                    </h3>
                    {file.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid={`text-description-${file.id}`}>
                        {file.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span data-testid={`text-closed-date-${file.id}`}>
                          Closed: {file.closedAt ? format(new Date(file.closedAt), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" data-testid={`badge-status-${file.id}`}>
                    {file.status}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
