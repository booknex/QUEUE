import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown, Settings } from "lucide-react";
import { PipelineManager } from "./PipelineManager";
import type { Pipeline } from "@shared/schema";

export function KanbanView() {
  const [activeView, setActiveView] = useState("opportunities");
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [pipelineManagerOpen, setPipelineManagerOpen] = useState(false);

  const { data: pipelines = [] } = useQuery<Pipeline[]>({
    queryKey: ["/api/pipelines"],
  });

  // Get the currently selected pipeline
  const selectedPipeline = selectedPipelineId
    ? pipelines.find((p) => p.id === selectedPipelineId)
    : null;

  // Determine what to display in the dropdown button
  const dropdownButtonText = selectedPipeline ? selectedPipeline.name : "All Pipelines";

  return (
    <div className="space-y-4" data-testid="kanban-view">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <CardTitle>Kanban Board</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-48"
                    data-testid="button-pipeline-dropdown"
                  >
                    {dropdownButtonText}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48" data-testid="menu-pipeline-dropdown">
                  <DropdownMenuItem
                    onClick={() => setSelectedPipelineId(null)}
                    data-testid="menu-item-all-pipelines"
                  >
                    All Pipelines
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {pipelines.map((pipeline) => (
                    <DropdownMenuItem
                      key={pipeline.id}
                      onClick={() => setSelectedPipelineId(pipeline.id)}
                      data-testid={`menu-item-pipeline-${pipeline.id}`}
                    >
                      {pipeline.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setPipelineManagerOpen(true)}
                    data-testid="menu-item-manage-pipelines"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Pipelines
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-2" data-testid="kanban-sidebar">
          <Button
            variant={activeView === "opportunities" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("opportunities")}
            data-testid="button-sidebar-opportunities"
          >
            Opportunities
          </Button>
          <Button
            variant={activeView === "pipelines" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("pipelines")}
            data-testid="button-sidebar-contacts"
          >
            Contacts
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
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
            <>
              {selectedPipelineId === null && pipelines.length === 0 && (
                <div className="text-center py-16" data-testid="content-no-pipelines">
                  <p className="text-muted-foreground mb-4">
                    No pipelines yet. Create your first pipeline to get started.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setPipelineManagerOpen(true)}
                    data-testid="button-create-first-pipeline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Pipeline
                  </Button>
                </div>
              )}

              {selectedPipelineId === null && pipelines.length > 0 && (
                <div className="text-center py-16" data-testid="content-all-pipelines">
                  <p className="text-muted-foreground mb-4">
                    Select a specific pipeline from the dropdown to view its kanban board
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {pipelines.map((pipeline) => (
                      <Button
                        key={pipeline.id}
                        variant="outline"
                        onClick={() => setSelectedPipelineId(pipeline.id)}
                        data-testid={`button-select-pipeline-${pipeline.id}`}
                      >
                        {pipeline.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedPipelineId !== null && selectedPipeline && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid={`content-pipeline-${selectedPipelineId}`}>
                  <div className="space-y-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Lead</CardTitle>
                      </CardHeader>
                    </Card>
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No {selectedPipeline.name.toLowerCase()} leads yet
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Qualified</CardTitle>
                      </CardHeader>
                    </Card>
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No {selectedPipeline.name.toLowerCase()} qualified yet
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Converted</CardTitle>
                      </CardHeader>
                    </Card>
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No {selectedPipeline.name.toLowerCase()} converted yet
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PipelineManager open={pipelineManagerOpen} onClose={() => setPipelineManagerOpen(false)} />
    </div>
  );
}
