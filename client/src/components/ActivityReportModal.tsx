import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Activity, Calendar, Clock, FileText } from "lucide-react";

type Period = "current_day" | "prior_day" | "current_week" | "prior_week";

interface ActivityUser {
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  touchCount: number;
  avgTouchesPerHour: number;
  clientsTouched: {
    fileId: number;
    clientName: string;
    touchedAt: string;
    notes: string | null;
  }[];
}

interface ActivityReport {
  period: string;
  startDate: string;
  endDate: string;
  periodHours: number;
  users: ActivityUser[];
}

interface ActivityReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number | null;
}

const periodLabels: Record<Period, string> = {
  current_day: "Today",
  prior_day: "Yesterday",
  current_week: "This Week",
  prior_week: "Last Week",
};

export function ActivityReportModal({ open, onOpenChange, companyId }: ActivityReportModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("current_day");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const { data: report, isLoading } = useQuery<ActivityReport>({
    queryKey: ["/api/activity-report", companyId, selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/activity-report?companyId=${companyId}&period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error("Failed to fetch activity report");
      }
      return response.json();
    },
    enabled: open && !!companyId,
  });

  const toggleUser = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const getInitials = (user: ActivityUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (user: ActivityUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const formatDateRange = () => {
    if (!report) return "";
    const start = new Date(report.startDate);
    const end = new Date(report.endDate);
    end.setDate(end.getDate() - 1);
    
    if (selectedPeriod === "current_day" || selectedPeriod === "prior_day") {
      return format(start, "MMMM d, yyyy");
    }
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  };

  const totalTouches = report?.users.reduce((sum, user) => sum + user.touchCount, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" data-testid="dialog-activity-report">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" data-testid="text-activity-report-title">
            <Activity className="h-5 w-5" />
            Activity Report
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(periodLabels) as Period[]).map((period) => (
            <Button
              key={period}
              size="sm"
              variant={selectedPeriod === period ? "default" : "outline"}
              onClick={() => setSelectedPeriod(period)}
              data-testid={`button-period-${period}`}
            >
              {periodLabels[period]}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span data-testid="text-date-range">{formatDateRange()}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span data-testid="text-total-touches">{totalTouches} total touches</span>
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 mt-2" data-testid="scroll-activity-users">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !report?.users.length ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-activity">
              No activity recorded for this period
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {report.users.map((user) => (
                <Collapsible
                  key={user.userId}
                  open={expandedUsers.has(user.userId)}
                  onOpenChange={() => toggleUser(user.userId)}
                >
                  <CollapsibleTrigger asChild>
                    <div
                      className="flex items-center gap-3 p-3 rounded-md cursor-pointer hover-elevate bg-muted/50"
                      data-testid={`card-user-${user.userId}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate" data-testid={`text-username-${user.userId}`}>
                          {getDisplayName(user)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{user.username}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" data-testid={`badge-touch-count-${user.userId}`}>
                          {user.touchCount} {user.touchCount === 1 ? "touch" : "touches"}
                        </Badge>
                        <span className="text-xs text-muted-foreground" data-testid={`text-avg-per-hour-${user.userId}`}>
                          {user.avgTouchesPerHour}/hr avg
                        </span>
                      </div>
                      {expandedUsers.has(user.userId) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-[52px] mt-2 space-y-2 pb-2">
                      {user.clientsTouched.map((touch, idx) => (
                        <div
                          key={`${touch.fileId}-${idx}`}
                          className="flex items-start gap-2 p-2 rounded-md bg-background border text-sm"
                          data-testid={`touch-item-${touch.fileId}-${idx}`}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium" data-testid={`text-client-name-${touch.fileId}`}>
                              {touch.clientName}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {format(new Date(touch.touchedAt), "MMM d, h:mm a")}
                            </div>
                            {touch.notes && (
                              <div className="mt-1 text-muted-foreground italic" data-testid={`text-touch-notes-${touch.fileId}`}>
                                "{touch.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
