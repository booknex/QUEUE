import { Card } from "@/components/ui/card";
import { LucideIcon, AlertCircle, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  testId: string;
  onClick?: () => void;
  urgencyState?: "red" | "green" | "neutral";
  menu?: {
    onEdit?: () => void;
    onDelete?: () => void;
  };
}

export function StatsCard({ title, value, icon: Icon, description, testId, onClick, urgencyState = "neutral", menu }: StatsCardProps) {
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
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking menu
    if (!e.defaultPrevented && onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className={`p-3 ${isClickable ? 'cursor-pointer hover-elevate active-elevate-2' : ''} ${getBackgroundClass()}`}
      data-testid={testId}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{title}</p>
          <p className="text-xl font-bold text-foreground flex items-center gap-1.5" data-testid={`${testId}-value`}>
            {value}
            {urgencyState === "red" && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-start gap-1">
          <div className={`p-1.5 rounded-md ${getIconColor()}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          {menu && (menu.onEdit || menu.onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover-elevate"
                  data-testid={`${testId}-menu`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" data-testid={`${testId}-menu-content`}>
                {menu.onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); menu.onEdit?.(); }} data-testid={`${testId}-menu-edit`}>
                    Edit
                  </DropdownMenuItem>
                )}
                {menu.onDelete && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); menu.onDelete?.(); }} data-testid={`${testId}-menu-delete`}>
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  );
}
