import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { AddOpportunityModal } from "./AddOpportunityModal";
import Contacts from "@/pages/Contacts";
import type { Pipeline, OpportunityWithContact } from "@shared/schema";

export function KanbanView() {
  const [activeView, setActiveView] = useState<"opportunities" | "pipelines" | "pipeline-kanban" | "contacts">("opportunities");
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [pipelineManagerOpen, setPipelineManagerOpen] = useState(false);
  const [addOpportunityOpen, setAddOpportunityOpen] = useState(false);

  const { data: pipelines = [] } = useQuery<Pipeline[]>({
    queryKey: ["/api/pipelines"],
  });

  const { data: opportunities = [] } = useQuery<OpportunityWithContact[]>({
    queryKey: ["/api/opportunities"],
  });

  const selectedPipeline = selectedPipelineId
    ? pipelines.find((p) => p.id === selectedPipelineId)
    : null;

  const dropdownButtonText = selectedPipeline ? selectedPipeline.name : "Select Pipeline";

  const handlePipelineSelect = (pipelineId: number) => {
    setSelectedPipelineId(pipelineId);
    setActiveView("pipeline-kanban");
  };

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
                  {pipelines.map((pipeline) => (
                    <DropdownMenuItem
                      key={pipeline.id}
                      onClick={() => handlePipelineSelect(pipeline.id)}
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
                variant={activeView === "pipelines" || activeView === "pipeline-kanban" ? "default" : "outline"}
                onClick={() => setActiveView("pipelines")}
                data-testid="button-header-pipelines"
              >
                Pipelines
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddOpportunityOpen(true)}
                data-testid="button-kanban-add"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Opportunity
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
            variant={activeView === "contacts" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("contacts")}
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
                {opportunities.filter((opp) => opp.column === "new").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No opportunities yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunities
                      .filter((opp) => opp.column === "new")
                      .map((opportunity) => (
                        <Card key={opportunity.id} data-testid={`opportunity-card-${opportunity.id}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{opportunity.contactName || opportunity.title}</CardTitle>
                          </CardHeader>
                          {opportunity.description && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">In Progress</CardTitle>
                  </CardHeader>
                </Card>
                {opportunities.filter((opp) => opp.column === "in_progress").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No opportunities yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunities
                      .filter((opp) => opp.column === "in_progress")
                      .map((opportunity) => (
                        <Card key={opportunity.id} data-testid={`opportunity-card-${opportunity.id}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{opportunity.contactName || opportunity.title}</CardTitle>
                          </CardHeader>
                          {opportunity.description && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Closed</CardTitle>
                  </CardHeader>
                </Card>
                {opportunities.filter((opp) => opp.column === "closed").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No opportunities yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunities
                      .filter((opp) => opp.column === "closed")
                      .map((opportunity) => (
                        <Card key={opportunity.id} data-testid={`opportunity-card-${opportunity.id}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{opportunity.contactName || opportunity.title}</CardTitle>
                          </CardHeader>
                          {opportunity.description && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === "pipelines" && (
            <div className="space-y-4" data-testid="content-pipelines">
              {pipelines.length === 0 ? (
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
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">All Pipelines</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPipelineManagerOpen(true)}
                      data-testid="button-manage-pipelines"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pipelines.map((pipeline) => (
                      <Card key={pipeline.id} data-testid={`pipeline-card-${pipeline.id}`}>
                        <CardHeader>
                          <CardTitle className="text-base">{pipeline.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(pipeline.createdAt).toLocaleDateString()}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePipelineSelect(pipeline.id)}
                              data-testid={`button-view-pipeline-${pipeline.id}`}
                            >
                              View Board
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === "pipeline-kanban" && selectedPipeline && (
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

          {activeView === "contacts" && (
            <div data-testid="content-contacts">
              <Contacts />
            </div>
          )}
        </div>
      </div>

      <PipelineManager open={pipelineManagerOpen} onClose={() => setPipelineManagerOpen(false)} />
      <AddOpportunityModal open={addOpportunityOpen} onClose={() => setAddOpportunityOpen(false)} />
    </div>
  );
}
