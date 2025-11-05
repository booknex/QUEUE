import { Clock, Eye, CheckCircle2, Circle, Loader2, History, MoreVertical, Edit2, Trash2, XCircle, Tag } from "lucide-react";
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
import type { ClientFile, Pipeline } from "@shared/schema";
import { useState } from "react";
import { SessionHistory } from "./SessionHistory";

interface QueueItemProps {
  file: ClientFile;
  pipelines: Pipeline[];
  onTouch: (id: number) => void;
  onEdit: (file: ClientFile) => void;
  onDelete: (id: number) => void;
  onClose: (file: ClientFile) => void;
  onPipelineChange: (fileId: number, pipelineId: number | null) => void;
  now?: number;
}

function getUrgencyLevel(createdAt: Date, lastTouchedAt: Date | null, now: number = Date.now()): {
  level: "low" | "medium" | "high" | "critical";
  color: string;
} {
  const referenceTime = lastTouchedAt || createdAt;
  const hoursSince = (now - new Date(referenceTime).getTime()) / (1000 * 60 * 60);

  if (hoursSince < 12) {
    return { level: "low", color: "bg-green-500" };
  } else if (hoursSince < 24) {
    return { level: "medium", color: "bg-yellow-500" };
  } else if (hoursSince < 48) {
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
  variant: "default" | "secondary";
  icon: React.ReactNode;
} {
  switch (status) {
    case "in_progress":
      return {
        label: "In Progress",
        variant: "default",
        icon: <Loader2 className="w-3 h-3" />,
      };
    default:
      return {
        label: "Waiting",
        variant: "secondary",
        icon: <Circle className="w-3 h-3" />,
      };
  }
}

function isRecentlyTouched(lastTouchedAt: Date | null, now: number = Date.now()): boolean {
  if (!lastTouchedAt) return false;
  const hoursSince = (now - new Date(lastTouchedAt).getTime()) / (1000 * 60 * 60);
  return hoursSince < 12;
}

function needsAttention(lastTouchedAt: Date | null, now: number = Date.now()): boolean {
  if (!lastTouchedAt) return true;
  const hoursSince = (now - new Date(lastTouchedAt).getTime()) / (1000 * 60 * 60);
  return hoursSince >= 12;
}

export function QueueItem({ file, pipelines, onTouch, onEdit, onDelete, onClose, onPipelineChange, now = Date.now() }: QueueItemProps) {
  const [sessionHistoryOpen, setSessionHistoryOpen] = useState(false);
  const urgency = getUrgencyLevel(file.createdAt, file.lastTouchedAt, now);
  const waitTime = getWaitTime(file.createdAt, file.lastTouchedAt);
  const statusConfig = getStatusConfig(file.status);
  const recentlyTouched = isRecentlyTouched(file.lastTouchedAt, now);
  const attention = needsAttention(file.lastTouchedAt, now);
  
  const currentPipeline = file.pipelineId 
    ? pipelines.find(p => p.id === file.pipelineId) 
    : null;
  
  const cardClassName = `relative overflow-visible transition-all duration-200 w-[268px] flex-shrink-0 cursor-pointer hover-elevate ${
    attention ? "border-2 border-red-500" : recentlyTouched ? "border-2 border-green-500" : ""
  }`;

  const edgeBarColor = recentlyTouched ? "bg-green-500" : attention ? "bg-red-500" : urgency.color;

  return (
    <>
    <SessionHistory 
      file={file} 
      open={sessionHistoryOpen} 
      onOpenChange={setSessionHistoryOpen}
    />
    <Card
      className={cardClassName}
      data-testid={`card-queue-item-${file.id}`}
      data-recently-touched={String(recentlyTouched)}
      data-needs-attention={String(attention)}
      onClick={() => onEdit(file)}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${edgeBarColor}`}
        data-testid={`indicator-urgency-${file.id}`}
      />
      
      <div className="flex flex-col gap-2 p-2.5 pl-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-muted-foreground font-mono text-xs font-semibold" data-testid={`text-touch-count-${file.id}`}>
            <span>{file.touchCount || 0} touches</span>
          </div>
          <div className="flex items-center gap-0.5 text-muted-foreground font-mono text-xs" data-testid={`text-wait-time-${file.id}`}>
            <Clock className="w-3 h-3" />
            <span>{waitTime}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1.5">
            <h3 className="text-sm font-medium text-foreground mb-0.5" data-testid={`text-client-name-${file.id}`}>
              {file.clientName}
            </h3>
            {file.description && (
              <p className="text-xs text-muted-foreground line-clamp-2" data-testid={`text-description-${file.id}`}>
                {file.description}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant={statusConfig.variant} className="gap-0.5 text-xs py-0 h-5" data-testid={`badge-status-${file.id}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
              {currentPipeline && (
                <Badge variant="outline" className="gap-0.5 text-xs py-0 h-5" data-testid={`badge-pipeline-${file.id}`}>
                  <Tag className="w-3 h-3" />
                  {currentPipeline.name}
                </Badge>
              )}
            </div>
            
            {file.lastTouchedAt && (
              <p className="text-xs text-muted-foreground" data-testid={`text-last-touched-${file.id}`}>
                Last touched: {formatDistanceToNow(new Date(file.lastTouchedAt), { addSuffix: true })}
              </p>
            )}

            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onTouch(file.id);
                }}
                className="w-full justify-start h-7 text-xs"
                data-testid={`button-touch-${file.id}`}
              >
                <Eye className="w-3 h-3 mr-1" />
                Touch
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start h-7 text-xs"
                    data-testid={`button-pipeline-${file.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {currentPipeline ? currentPipeline.name : "Set Pipeline"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48" onClick={(e) => e.stopPropagation()}>
                  {currentPipeline && (
                    <DropdownMenuItem
                      onSelect={() => onPipelineChange(file.id, null)}
                      data-testid={`menu-pipeline-none-${file.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Remove Pipeline
                    </DropdownMenuItem>
                  )}
                  {pipelines.map((pipeline) => (
                    <DropdownMenuItem
                      key={pipeline.id}
                      onSelect={() => onPipelineChange(file.id, pipeline.id)}
                      data-testid={`menu-pipeline-${pipeline.id}-${file.id}`}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      {pipeline.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start h-7 text-xs"
                    data-testid={`button-menu-${file.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3 mr-1" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem
                    onSelect={() => setSessionHistoryOpen(true)}
                    data-testid={`menu-history-${file.id}`}
                  >
                    <History className="w-4 h-4 mr-2" />
                    History
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onClose(file)}
                    data-testid={`menu-close-${file.id}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Close
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
