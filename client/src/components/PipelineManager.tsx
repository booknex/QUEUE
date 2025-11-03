import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Pipeline } from "@shared/schema";

interface PipelineManagerProps {
  open: boolean;
  onClose: () => void;
}

export function PipelineManager({ open, onClose }: PipelineManagerProps) {
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [deletingPipeline, setDeletingPipeline] = useState<Pipeline | null>(null);
  const [name, setName] = useState("");
  const { toast } = useToast();

  const { data: pipelines = [] } = useQuery<Pipeline[]>({
    queryKey: ["/api/pipelines"],
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return await apiRequest("POST", "/api/pipelines", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      setName("");
      toast({
        title: "Pipeline created",
        description: "The pipeline has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pipeline.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      return await apiRequest("PATCH", `/api/pipelines/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      setEditingPipeline(null);
      setName("");
      toast({
        title: "Pipeline updated",
        description: "The pipeline has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pipeline.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/pipelines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pipelines"] });
      setDeletingPipeline(null);
      toast({
        title: "Pipeline deleted",
        description: "The pipeline has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete pipeline.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPipeline) {
      updateMutation.mutate({ id: editingPipeline.id, name: name.trim() });
    } else {
      createMutation.mutate({ name: name.trim() });
    }
  };

  const handleEdit = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setName(pipeline.name);
  };

  const handleCancelEdit = () => {
    setEditingPipeline(null);
    setName("");
  };

  const handleDelete = (pipeline: Pipeline) => {
    setDeletingPipeline(pipeline);
  };

  const confirmDelete = () => {
    if (deletingPipeline) {
      deleteMutation.mutate(deletingPipeline.id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-pipeline-manager">
          <DialogHeader>
            <DialogTitle>Manage Pipelines</DialogTitle>
            <DialogDescription>
              Add, edit, or delete your pipelines. Each pipeline will have its own dedicated kanban board.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pipeline-name">
                {editingPipeline ? "Edit Pipeline" : "New Pipeline"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="pipeline-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter pipeline name..."
                  data-testid="input-pipeline-name"
                />
                <Button
                  type="submit"
                  disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-pipeline"
                >
                  {editingPipeline ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
                {editingPipeline && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>

          <div className="space-y-2">
            <Label>Existing Pipelines</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {pipelines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-pipelines">
                  No pipelines yet. Add one above.
                </p>
              ) : (
                pipelines.map((pipeline) => (
                  <div
                    key={pipeline.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                    data-testid={`pipeline-item-${pipeline.id}`}
                  >
                    <span className="font-medium">{pipeline.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(pipeline)}
                        data-testid={`button-edit-pipeline-${pipeline.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(pipeline)}
                        data-testid={`button-delete-pipeline-${pipeline.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingPipeline} onOpenChange={() => setDeletingPipeline(null)}>
        <AlertDialogContent data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPipeline?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
