import { Card } from "@/components/ui/card";
import { LucideIcon, AlertCircle } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  testId: string;
  onClick?: () => void;
  urgencyState?: "red" | "green" | "neutral";
}

export function StatsCard({ title, value, icon: Icon, description, testId, onClick, urgencyState = "neutral" }: StatsCardProps) {
  const isClickable = !!onClick;
  
  const getBackgroundClass = () => {
    if (urgencyState === "red") return "bg-red-500/20 border-red-500";
    if (urgencyState === "green") return "bg-green-500/20 border-green-500";
    return "";
  };
  
  const getIconColor = () => {
    if (urgencyState === "red") return "bg-red-500/30 text-red-700 dark:text-red-400";
    if (urgencyState === "green") return "bg-green-500/30 text-green-700 dark:text-green-400";
    return "bg-primary/10 text-primary";
  };
  
  return (
    <Card 
      className={`p-3 ${isClickable ? 'cursor-pointer hover-elevate active-elevate-2' : ''} ${getBackgroundClass()}`}
      data-testid={testId}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{title}</p>
          <p className="text-xl font-bold text-foreground flex items-center gap-1.5" data-testid={`${testId}-value`}>
            {value}
            {urgencyState === "red" && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </p>
          {urgencyState === "red" && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1" data-testid={`${testId}-warning`}>
              CLIENT IDLE FOR 48HRS
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <div className={`p-1.5 rounded-md ${getIconColor()}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  );
}
