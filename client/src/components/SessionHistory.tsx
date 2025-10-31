import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import type { WorkSession, ClientFile } from "@shared/schema";

interface SessionHistoryProps {
  file: ClientFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionHistory({ file, open, onOpenChange }: SessionHistoryProps) {
  const { data: sessions = [], isLoading } = useQuery<WorkSession[]>({
    queryKey: ["/api/files", file.id, "sessions"],
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-session-history">
        <DialogHeader>
          <DialogTitle>Work Session History - {file.clientName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground" data-testid="loading-sessions">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-sessions">
              <Clock className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No work sessions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sessions will appear here when you touch this file
              </p>
            </div>
          ) : (
            <div className="space-y-3 pr-4" data-testid="sessions-list">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-md p-4 bg-card"
                  data-testid={`session-${session.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" data-testid={`session-time-${session.id}`}>
                          {format(new Date(session.startedAt), "PPp")}
                        </p>
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-1" data-testid={`session-notes-${session.id}`}>
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
