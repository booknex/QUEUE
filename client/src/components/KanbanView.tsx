import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, ChevronDown, Settings, Trash2, X } from "lucide-react";
import { PipelineManager } from "./PipelineManager";
import { AddOpportunityModal } from "./AddOpportunityModal";
import Contacts from "@/pages/Contacts";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Pipeline, OpportunityWithContact, KanbanColumn } from "@shared/schema";

export function KanbanView() {
  const [activeView, setActiveView] = useState<"opportunities" | "pipelines" | "pipeline-kanban" | "contacts">("opportunities");
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [pipelineManagerOpen, setPipelineManagerOpen] = useState(false);
  const [addOpportunityOpen, setAddOpportunityOpen] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const { toast } = useToast();

  const { data: pipelines = [] } = useQuery<Pipeline[]>({
    queryKey: ["/api/pipelines"],
  });

  const { data: opportunityColumns = [] } = useQuery<KanbanColumn[]>({
    queryKey: ["/api/columns", "null"],
    queryFn: async () => {
      const response = await fetch("/api/columns?pipelineId=null");
      if (!response.ok) throw new Error("Failed to fetch columns");
      return response.json();
    },
  });

  const { data: opportunities = [] } = useQuery<OpportunityWithContact[]>({
    queryKey: ["/api/opportunities"],
  });

  const createColumnMutation = useMutation({
    mutationFn: async (name: string) => {
      const maxPosition = opportunityColumns.length > 0 
        ? Math.max(...opportunityColumns.map(c => c.position))
        : -1;
      
      const response = await apiRequest("POST", "/api/columns", {
        name,
        position: maxPosition + 1,
        pipelineId: null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/columns", "null"] });
      setNewColumnName("");
      setAddColumnOpen(false);
      toast({
        title: "Column created",
        description: "New column has been added to the board.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create column.",
        variant: "destructive",
      });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: number) => {
      await apiRequest("DELETE", `/api/columns/${columnId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/columns", "null"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Column deleted",
        description: "Column and its opportunities have been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete column.",
        variant: "destructive",
      });
    },
  });

  const updateOpportunityColumnMutation = useMutation({
    mutationFn: async ({ opportunityId, columnId }: { opportunityId: number; columnId: number }) => {
      await apiRequest("PATCH", `/api/opportunities/${opportunityId}`, { columnId });
    },
    onMutate: async ({ opportunityId, columnId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/opportunities"] });

      // Snapshot the previous value
      const previousOpportunities = queryClient.getQueryData<OpportunityWithContact[]>(["/api/opportunities"]);

      // Optimistically update the cache
      queryClient.setQueryData<OpportunityWithContact[]>(
        ["/api/opportunities"],
        (old) => {
          if (!old) return old;
          return old.map((opp) =>
            opp.id === opportunityId ? { ...opp, columnId } : opp
          );
        }
      );

      // Return context with the snapshot
      return { previousOpportunities };
    },
    onError: (_error, _variables, context) => {
      // Revert to the previous value on error
      if (context?.previousOpportunities) {
        queryClient.setQueryData(["/api/opportunities"], context.previousOpportunities);
      }
      toast({
        title: "Error",
        description: "Failed to move opportunity.",
        variant: "destructive",
      });
    },
  });

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      createColumnMutation.mutate(newColumnName.trim());
    }
  };

  const handleDeleteColumn = (columnId: number) => {
    if (confirm("Are you sure you want to delete this column? All opportunities in this column will also be deleted.")) {
      deleteColumnMutation.mutate(columnId);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId) {
      return;
    }

    const opportunityId = parseInt(draggableId);
    const newColumnId = parseInt(destination.droppableId);

    updateOpportunityColumnMutation.mutate({
      opportunityId,
      columnId: newColumnId,
    });
  };

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
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${opportunityColumns.length + 1}, minmax(250px, 1fr))` }} data-testid="content-opportunities">
                {opportunityColumns.map((column) => (
                  <div key={column.id} className="space-y-3">
                    <Card>
                      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
                        <CardTitle className="text-base">{column.name}</CardTitle>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteColumn(column.id)}
                          data-testid={`button-delete-column-${column.id}`}
                          className="h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </CardHeader>
                    </Card>
                    <Droppable droppableId={column.id.toString()}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[100px] rounded-md transition-colors ${
                            snapshot.isDraggingOver ? "bg-accent/20" : ""
                          }`}
                        >
                          {opportunities.filter((opp) => opp.columnId === column.id).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              No opportunities yet
                            </div>
                          ) : (
                            opportunities
                              .filter((opp) => opp.columnId === column.id)
                              .map((opportunity, index) => (
                                <Draggable
                                  key={opportunity.id}
                                  draggableId={opportunity.id.toString()}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      data-testid={`opportunity-card-${opportunity.id}`}
                                      className={`cursor-grab active:cursor-grabbing ${
                                        snapshot.isDragging ? "shadow-lg" : ""
                                      }`}
                                    >
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-base">{opportunity.contactName || opportunity.title}</CardTitle>
                                      </CardHeader>
                                      {opportunity.description && (
                                        <CardContent>
                                          <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                                        </CardContent>
                                      )}
                                    </Card>
                                  )}
                                </Draggable>
                              ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              
              {/* Add Column Button */}
              <div className="space-y-3">
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setAddColumnOpen(true)}
                      data-testid="button-add-column"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Column
                    </Button>
                  </CardHeader>
                </Card>
              </div>
              </div>
            </DragDropContext>
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
      
      {/* Add Column Dialog */}
      <Dialog open={addColumnOpen} onOpenChange={setAddColumnOpen}>
        <DialogContent data-testid="dialog-add-column">
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
            <DialogDescription>
              Create a new column for organizing opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Enter column name..."
              data-testid="input-column-name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddColumn();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAddColumnOpen(false)}
                data-testid="button-cancel-column"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddColumn}
                disabled={!newColumnName.trim() || createColumnMutation.isPending}
                data-testid="button-submit-column"
              >
                {createColumnMutation.isPending ? "Creating..." : "Create Column"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
