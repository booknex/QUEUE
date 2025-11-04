import { useState, useEffect } from "react";
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

interface KanbanViewProps {
  selectedPipelineId: number | null;
  onPipelineChange: (id: number) => void;
}

export function KanbanView({ selectedPipelineId, onPipelineChange }: KanbanViewProps) {
  const [activeView, setActiveView] = useState<"opportunities" | "contacts">("opportunities");
  const [pipelineManagerOpen, setPipelineManagerOpen] = useState(false);
  const [addOpportunityOpen, setAddOpportunityOpen] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const { toast } = useToast();
  
  // Local state for drag-and-drop (prevents React Query cache flicker)
  const [localOpportunities, setLocalOpportunities] = useState<OpportunityWithContact[]>([]);

  const { data: pipelines = [] } = useQuery<Pipeline[]>({
    queryKey: ["/api/pipelines"],
  });
  
  // Fetch columns for the selected pipeline
  const { data: pipelineColumns = [] } = useQuery<KanbanColumn[]>({
    queryKey: ["/api/columns", selectedPipelineId?.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/columns?pipelineId=${selectedPipelineId}`);
      if (!response.ok) throw new Error("Failed to fetch columns");
      return response.json();
    },
    enabled: selectedPipelineId !== null,
  });

  const { data: opportunities = [] } = useQuery<OpportunityWithContact[]>({
    queryKey: ["/api/opportunities"],
  });
  
  // Sync React Query data to local state for drag operations
  useEffect(() => {
    setLocalOpportunities(opportunities);
  }, [opportunities]);

  const createColumnMutation = useMutation({
    mutationFn: async (name: string) => {
      const maxPosition = pipelineColumns.length > 0 
        ? Math.max(...pipelineColumns.map(c => c.position))
        : -1;
      
      const response = await apiRequest("POST", "/api/columns", {
        name,
        position: maxPosition + 1,
        pipelineId: selectedPipelineId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/columns", selectedPipelineId?.toString()] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/columns", selectedPipelineId?.toString()] });
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
    mutationFn: async ({ opportunityId, columnId, position }: { opportunityId: number; columnId: number; position: number }) => {
      await apiRequest("PATCH", `/api/opportunities/${opportunityId}`, { columnId, position });
    },
    onSuccess: () => {
      // Silently update React Query cache to match local state
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
    },
    onError: () => {
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

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const opportunityId = parseInt(draggableId);
    const newColumnId = parseInt(destination.droppableId);
    const newPosition = destination.index;

    // Work with local state instead of React Query cache
    const currentOpportunities = [...localOpportunities];
    
    // Find the dragged item
    const draggedItem = currentOpportunities.find((opp) => opp.id === opportunityId);
    
    if (!draggedItem) {
      return;
    }

    const sourceColumnId = draggedItem.columnId;

    // Update local state immediately for instant visual feedback
    const withoutDragged = currentOpportunities.filter((opp) => opp.id !== opportunityId);
    
    // Get all items in destination column, sorted by position
    const destColumnItems = withoutDragged
      .filter((opp) => opp.columnId === newColumnId)
      .sort((a, b) => a.position - b.position);
    
    // Insert dragged item at new position
    destColumnItems.splice(newPosition, 0, { ...draggedItem, columnId: newColumnId, position: newPosition });
    
    // Create new objects with updated positions for destination column (immutable)
    const destColumnWithPositions = destColumnItems.map((item, idx) => ({
      ...item,
      position: idx
    }));
    
    // If source and destination columns are different, reindex source column
    let sourceColumnWithPositions: OpportunityWithContact[] = [];
    if (sourceColumnId !== newColumnId) {
      const sourceColumnItems = withoutDragged
        .filter((opp) => opp.columnId === sourceColumnId)
        .sort((a, b) => a.position - b.position);
      
      // Create new objects with updated positions (immutable)
      sourceColumnWithPositions = sourceColumnItems.map((item, idx) => ({
        ...item,
        position: idx
      }));
    }
    
    // Get items from other columns (unchanged)
    const otherItems = withoutDragged.filter(
      (opp) => opp.columnId !== newColumnId && opp.columnId !== sourceColumnId
    );
    
    // Update local state immediately (no React Query cache update = no flicker)
    const updatedOpportunities = [...destColumnWithPositions, ...sourceColumnWithPositions, ...otherItems];
    setLocalOpportunities(updatedOpportunities);

    // Send update to server in background
    updateOpportunityColumnMutation.mutate(
      {
        opportunityId,
        columnId: newColumnId,
        position: newPosition,
      },
      {
        onError: () => {
          // Revert local state on error
          setLocalOpportunities(currentOpportunities);
        }
      }
    );
  };

  const selectedPipeline = selectedPipelineId
    ? pipelines.find((p) => p.id === selectedPipelineId)
    : null;

  const dropdownButtonText = selectedPipeline ? selectedPipeline.name : "Select Pipeline";

  const handlePipelineSelect = (pipelineId: number) => {
    onPipelineChange(pipelineId);
  };

  return (
    <div className="flex gap-4" data-testid="kanban-view">
      {/* Full-height Sidebar */}
      <div className="w-56 flex-shrink-0 bg-sidebar rounded-lg p-3 border border-sidebar-border" data-testid="kanban-sidebar">
        <div className="space-y-2">
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
      </div>

      {/* Right side: Header + Content */}
      <div className="flex-1 space-y-4">
        {/* Header Card */}
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPipelineManagerOpen(true)}
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

        {/* Content Area */}
        <div className="overflow-x-auto">
          {activeView === "opportunities" && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-4 min-w-max" data-testid="content-opportunities">
                {pipelineColumns.map((column) => (
                  <div key={column.id} className="space-y-3 w-[280px] flex-shrink-0">
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
                        <CardTitle className="text-base text-primary">{column.name}</CardTitle>
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
                          className={`space-y-2 min-h-[700px] p-3 rounded-md transition-colors border ${
                            snapshot.isDraggingOver ? "bg-primary/10 border-primary/30" : "bg-muted/10 border-border"
                          }`}
                        >
                          {localOpportunities.filter((opp) => opp.columnId === column.id).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              No opportunities yet
                            </div>
                          ) : (
                            localOpportunities
                              .filter((opp) => opp.columnId === column.id)
                              .sort((a, b) => a.position - b.position)
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
                                      className={`cursor-grab active:cursor-grabbing border-l-4 border-l-primary/60 hover-elevate ${
                                        snapshot.isDragging ? "opacity-50 shadow-lg" : ""
                                      }`}
                                      style={{
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      <CardHeader className="pb-2 pt-3 px-3">
                                        <CardTitle className="text-sm">{opportunity.contactName || opportunity.title}</CardTitle>
                                      </CardHeader>
                                      {opportunity.description && (
                                        <CardContent className="pt-0 pb-3 px-3">
                                          <p className="text-xs text-muted-foreground">{opportunity.description}</p>
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
              <div className="space-y-3 w-[280px] flex-shrink-0">
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

          {activeView === "contacts" && (
            <div data-testid="content-contacts">
              <Contacts />
            </div>
          )}
        </div>
      </div>

      <PipelineManager open={pipelineManagerOpen} onClose={() => setPipelineManagerOpen(false)} />
      <AddOpportunityModal 
        open={addOpportunityOpen} 
        onClose={() => setAddOpportunityOpen(false)} 
        selectedPipelineId={selectedPipelineId}
      />
      
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
