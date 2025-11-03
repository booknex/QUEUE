import { Clock, GripVertical, Eye, CheckCircle2, Circle, Loader2, History, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import type { ClientFile } from "@shared/schema";
import { useState } from "react";
import { SessionHistory } from "./SessionHistory";

interface QueueItemProps {
  file: ClientFile;
  onTouch: (id: number) => void;
  onEdit: (file: ClientFile) => void;
  onDelete: (id: number) => void;
  isDragging?: boolean;
  now?: number;
}

function getUrgencyLevel(createdAt: Date, lastTouchedAt: Date | null, now: number = Date.now()): {
  level: "low" | "medium" | "high" | "critical";
  color: string;
} {
  const referenceTime = lastTouchedAt || createdAt;
  const hoursSince = (now - new Date(referenceTime).getTime()) / (1000 * 60 * 60);

  if (hoursSince < 4) {
    return { level: "low", color: "bg-green-500" };
  } else if (hoursSince < 8) {
    return { level: "medium", color: "bg-yellow-500" };
  } else if (hoursSince < 24) {
    return { level: "high", color: "bg-orange-500" };
  } else {
    return { level: "critical", color: "bg-red-500" };
  }
}

function getWaitTime(createdAt: Date, lastTouchedAt: Date | null): string {
  const referenceTime = lastTouchedAt || createdAt;
  const totalSeconds = Math.floor((Date.now() - new Date(referenceTime).getTime()) / 1000);
  
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function getStatusConfig(status: string): {
  label: string;
  variant: "default" | "secondary" | "outline";
  icon: React.ReactNode;
} {
  switch (status) {
    case "in_progress":
      return {
        label: "In Progress",
        variant: "default",
        icon: <Loader2 className="w-3 h-3" />,
      };
    case "completed":
      return {
        label: "Completed",
        variant: "outline",
        icon: <CheckCircle2 className="w-3 h-3" />,
      };
    default:
      return {
        label: "Waiting",
        variant: "secondary",
        icon: <Circle className="w-3 h-3" />,
      };
  }
}

export function QueueItem({ file, onTouch, onEdit, onDelete, isDragging, now = Date.now() }: QueueItemProps) {
  const [sessionHistoryOpen, setSessionHistoryOpen] = useState(false);
  const urgency = getUrgencyLevel(file.createdAt, file.lastTouchedAt, now);
  const waitTime = getWaitTime(file.createdAt, file.lastTouchedAt);
  const statusConfig = getStatusConfig(file.status);

  return (
    <>
    <SessionHistory 
      file={file} 
      open={sessionHistoryOpen} 
      onOpenChange={setSessionHistoryOpen}
    />
    <Card
      className={`relative overflow-visible transition-all duration-200 w-80 flex-shrink-0 ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
      data-testid={`card-queue-item-${file.id}`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${urgency.color}`}
        data-testid={`indicator-urgency-${file.id}`}
      />
      
      <div className="flex flex-col gap-4 p-4 pl-6">
        <div className="flex items-center justify-between">
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover-elevate p-1 rounded"
            data-testid={`button-drag-${file.id}`}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-sm" data-testid={`text-wait-time-${file.id}`}>
            <Clock className="w-4 h-4" />
            <span>{waitTime}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h3 className="text-lg font-medium text-foreground mb-1" data-testid={`text-client-name-${file.id}`}>
              {file.clientName}
            </h3>
            {file.description && (
              <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-description-${file.id}`}>
                {file.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={statusConfig.variant} className="gap-1.5" data-testid={`badge-status-${file.id}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
            
            {file.lastTouchedAt && (
              <p className="text-xs text-muted-foreground" data-testid={`text-last-touched-${file.id}`}>
                Last touched: {formatDistanceToNow(new Date(file.lastTouchedAt), { addSuffix: true })}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTouch(file.id)}
                className="w-full justify-start"
                data-testid={`button-touch-${file.id}`}
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Touch
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start"
                    data-testid={`button-menu-${file.id}`}
                  >
                    <MoreVertical className="w-4 h-4 mr-1.5" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onSelect={() => setSessionHistoryOpen(true)}
                    data-testid={`menu-history-${file.id}`}
                  >
                    <History className="w-4 h-4 mr-2" />
                    History
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onEdit(file)}
                    data-testid={`menu-edit-${file.id}`}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onDelete(file.id)}
                    data-testid={`menu-delete-${file.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </>
  );
}
