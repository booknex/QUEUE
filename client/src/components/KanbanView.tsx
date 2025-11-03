import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function KanbanView() {
  const [activeView, setActiveView] = useState("opportunities");

  return (
    <div className="space-y-4" data-testid="kanban-view">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Kanban Board</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeView === "opportunities" ? "default" : "outline"}
                onClick={() => setActiveView("opportunities")}
                data-testid="button-header-opportunities"
              >
                Opportunities
              </Button>
              <Button
                size="sm"
                variant={activeView === "pipelines" ? "default" : "outline"}
                onClick={() => setActiveView("pipelines")}
                data-testid="button-header-pipelines"
              >
                Pipelines
              </Button>
              <Button size="sm" variant="outline" data-testid="button-kanban-add">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div>
        {activeView === "opportunities" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="content-opportunities">
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No opportunities yet
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">In Progress</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No opportunities yet
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Closed</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No opportunities yet
              </div>
            </div>
          </div>
        )}

        {activeView === "pipelines" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="content-pipelines">
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Lead</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pipelines yet
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Qualified</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pipelines yet
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Converted</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pipelines yet
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
