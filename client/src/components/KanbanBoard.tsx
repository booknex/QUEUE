import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, MoreVertical, Edit, Trash2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ClientFile } from "@shared/schema";

interface KanbanBoardProps {
  files: ClientFile[];
  onTouch: (id: number) => void;
  onEdit: (file: ClientFile) => void;
  onDelete: (id: number) => void;
  onClose: (file: ClientFile) => void;
  now: number;
}

const statusConfig = {
  waiting: {
    title: "Waiting",
    variant: "secondary" as const,
  },
  in_progress: {
    title: "In Progress",
    variant: "default" as const,
  },
  completed: {
    title: "Completed",
    variant: "outline" as const,
  },
};

function getWaitTime(file: ClientFile, now: number): string {
  const baseTime = file.lastTouchedAt || file.createdAt;
  const elapsed = now - baseTime.getTime();
  
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    return `${days}d ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function KanbanCard({ 
  file, 
  onTouch, 
  onEdit, 
  onDelete, 
  onClose,
  now 
}: { 
  file: ClientFile;
  onTouch: (id: number) => void;
  onEdit: (file: ClientFile) => void;
  onDelete: (id: number) => void;
  onClose: (file: ClientFile) => void;
  now: number;
}) {
  const waitTime = getWaitTime(file, now);
  const twelveHoursAgo = now - 12 * 60 * 60 * 1000;
  const lastTouchTime = file.lastTouchedAt?.getTime() || 0;
  const isRecent = lastTouchTime > 0 && lastTouchTime > twelveHoursAgo;
  const needsAttention = !file.lastTouchedAt || lastTouchTime <= twelveHoursAgo;

  return (
    <Card 
      className={`mb-3 cursor-pointer hover-elevate ${isRecent ? 'border-green-500' : needsAttention ? 'border-red-500' : ''}`}
      data-testid={`kanban-card-${file.id}`}
      onClick={() => onEdit(file)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-foreground flex-1" data-testid={`kanban-client-name-${file.id}`}>
            {file.clientName}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
                data-testid={`button-actions-${file.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onClose(file)} data-testid={`menu-close-${file.id}`}>
                <XCircle className="w-4 h-4 mr-2" />
                Close
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(file.id)}
                className="text-destructive"
                data-testid={`menu-delete-${file.id}`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {file.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {file.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono" data-testid={`kanban-wait-time-${file.id}`}>
            {waitTime}
          </span>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onTouch(file.id);
          }}
          size="sm"
          variant="outline"
          className="w-full"
          data-testid={`button-touch-${file.id}`}
        >
          Touch
        </Button>
      </CardContent>
    </Card>
  );
}

export function KanbanBoard({ 
  files, 
  onTouch, 
  onEdit, 
  onDelete, 
  onClose,
  now 
}: KanbanBoardProps) {
  const filesByStatus = {
    waiting: files.filter(f => f.status === "waiting"),
    in_progress: files.filter(f => f.status === "in_progress"),
    completed: files.filter(f => f.closedAt !== null),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="kanban-board">
      {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => (
        <div key={status} className="flex flex-col">
          <Card className="mb-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {statusConfig[status].title}
                </CardTitle>
                <Badge variant={statusConfig[status].variant} data-testid={`kanban-count-${status}`}>
                  {filesByStatus[status].length}
                </Badge>
              </div>
            </CardHeader>
          </Card>
          
          <div className="flex-1 overflow-y-auto max-h-[600px]" data-testid={`kanban-column-${status}`}>
            {filesByStatus[status].length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No {statusConfig[status].title.toLowerCase()} files
              </div>
            ) : (
              filesByStatus[status].map((file) => (
                <KanbanCard
                  key={file.id}
                  file={file}
                  onTouch={onTouch}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClose={onClose}
                  now={now}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
