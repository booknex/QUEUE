import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddClient: () => void;
}

export function EmptyState({ onAddClient }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FolderOpen className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No clients in queue</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
        Get started by adding your first client to the queue. You'll be able to track time and prioritize your work.
      </p>
      <Button onClick={onAddClient} data-testid="button-add-first-client">
        Add Your First Client
      </Button>
    </div>
  );
}
