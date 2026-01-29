import { Clock, Eye, CheckCircle2, Circle, Loader2, History, MoreVertical, Edit2, Trash2, XCircle, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import type { ClientFile, Pipeline } from "@shared/schema";
import { useState, memo, useEffect } from "react";
import { SessionHistory } from "./SessionHistory";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QueueItemProps {
  file: ClientFile;
  pipelines: Pipeline[];
  onTouch: (file: ClientFile) => void;
  onEdit: (file: ClientFile) => void;
  onDelete: (id: number) => void;
  onClose: (file: ClientFile) => void;
  now?: number;
}

function getUrgencyLevel(createdAt: Date, lastTouchedAt: Date | null, now: number = Date.now()): {
  level: "low" | "medium" | "high" | "critical";
  color: string;
  isRecentlyTouched: boolean;
} {
  // Calculate time since last touch or creation (whichever is most recent)
  const referenceTime = lastTouchedAt ? new Date(lastTouchedAt).getTime() : new Date(createdAt).getTime();
  const hoursSince = (now - referenceTime) / (1000 * 60 * 60);
  
  // Check if touched within 24 hours (only applies to touched files)
  const isRecentlyTouched = lastTouchedAt !== null && hoursSince < 24;

  // Apply color based on elapsed time
  if (hoursSince < 24) {
    return { level: "low", color: "bg-green-500", isRecentlyTouched };
  } else if (hoursSince < 48) {
    return { level: "high", color: "bg-yellow-500", isRecentlyTouched: false };
  } else {
    return { level: "critical", color: "bg-red-500", isRecentlyTouched: false };
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
  // System statuses use default variant, custom statuses use secondary
  const systemStatuses = ["APPROVED W/ CONDITIONS", "PRE-APPROVED", "LOAN SETUP"];
  const variant = systemStatuses.includes(status) ? "default" : "secondary";
  
  return {
    label: status,
    variant,
    icon: <Circle className="w-3 h-3" />,
  };
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

export function QueueItem({ file, pipelines, onTouch, onEdit, onDelete, onClose, now = Date.now() }: QueueItemProps) {
  const [sessionHistoryOpen, setSessionHistoryOpen] = useState(false);
  const [loanType, setLoanType] = useState(file.loanType || "");
  const [interestRate, setInterestRate] = useState(file.interestRate || "");
  const urgency = getUrgencyLevel(file.createdAt, file.lastTouchedAt, now);
  const waitTime = getWaitTime(file.createdAt, file.lastTouchedAt);
  const statusConfig = getStatusConfig(file.status);
  
  const updateMutation = useMutation({
    mutationFn: async (updates: { loanType?: string; interestRate?: string }) => {
      const res = await apiRequest("PATCH", `/api/files/${file.id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
  });
  
  const handleLoanTypeBlur = () => {
    if (loanType !== (file.loanType || "")) {
      updateMutation.mutate({ loanType });
    }
  };
  
  const handleInterestRateBlur = () => {
    if (interestRate !== (file.interestRate || "")) {
      updateMutation.mutate({ interestRate });
    }
  };
  
  // Sync local state when file prop changes (e.g., after modal update)
  useEffect(() => {
    setLoanType(file.loanType || "");
    setInterestRate(file.interestRate || "");
  }, [file.loanType, file.interestRate]);
  
  const currentPipeline = file.pipelineId 
    ? pipelines.find(p => p.id === file.pipelineId) 
    : null;
  
  // Determine card styling based on urgency level
  let cardBgClass = "";
  let cardBorderClass = "border-2";
  
  if (urgency.level === "low") {
    // 0-24 hours - Green background and border
    cardBgClass = "bg-green-500/10";
    cardBorderClass = "border-2 border-green-500";
  } else if (urgency.level === "high") {
    // 24-48 hours - Yellow background and border
    cardBgClass = "bg-yellow-500/10";
    cardBorderClass = "border-2 border-yellow-500";
  } else if (urgency.level === "critical") {
    // 48+ hours - Red background and border
    cardBgClass = "bg-red-500/10";
    cardBorderClass = "border-2 border-red-500";
  } else {
    // Default - No special color
    cardBorderClass = "border-2 border-border";
  }
  
  const cardClassName = `relative overflow-visible transition-all duration-200 w-[268px] flex-shrink-0 cursor-pointer hover-elevate ${cardBgClass} ${cardBorderClass}`;

  const edgeBarColor = urgency.color;

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
      data-urgency-level={urgency.level}
      onClick={() => onEdit(file)}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${edgeBarColor}`}
        data-testid={`indicator-urgency-${file.id}`}
      />
      
      <div className="flex flex-col p-2.5 pl-4 h-full">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-0.5 text-muted-foreground font-mono text-xs" data-testid={`text-wait-time-${file.id}`}>
            <Clock className="w-3 h-3" />
            <span>{waitTime}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                data-testid={`button-menu-${file.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
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

        <div className="flex-1 min-w-0 mb-2">
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
          </div>
          
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block">Loan Type</label>
              <Input
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                onBlur={handleLoanTypeBlur}
                onClick={(e) => e.stopPropagation()}
                placeholder="e.g. FHA"
                className="h-6 text-xs px-1.5"
                data-testid={`input-loan-type-${file.id}`}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block">Rate</label>
              <Input
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                onBlur={handleInterestRateBlur}
                onClick={(e) => e.stopPropagation()}
                placeholder="e.g. 6.5%"
                className="h-6 text-xs px-1.5"
                data-testid={`input-interest-rate-${file.id}`}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onTouch(file);
            }}
            className="w-full justify-between h-7 text-xs"
            data-testid={`button-touch-${file.id}`}
          >
            <div className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              Touch
            </div>
            <span className="font-mono text-muted-foreground font-semibold" data-testid={`text-touch-count-${file.id}`}>
              {file.touchCount || 0}
            </span>
          </Button>
        </div>
      </div>
    </Card>
    </>
  );
}
