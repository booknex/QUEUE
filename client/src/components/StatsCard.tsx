import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  testId: string;
  onClick?: () => void;
}

export function StatsCard({ title, value, icon: Icon, description, testId, onClick }: StatsCardProps) {
  const isClickable = !!onClick;
  
  return (
    <Card 
      className={`p-3 ${isClickable ? 'cursor-pointer hover-elevate active-elevate-2' : ''}`}
      data-testid={testId}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{title}</p>
          <p className="text-xl font-bold text-foreground" data-testid={`${testId}-value`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  );
}
