import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Clock, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { QueueItem } from "@/components/QueueItem";
import { AddEditClientModal } from "@/components/AddEditClientModal";
import { StatsCard } from "@/components/StatsCard";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ClientFile } from "@shared/schema";

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<ClientFile | null>(null);
  const { toast } = useToast();

  const { data: files = [], isLoading } = useQuery<ClientFile[]>({
    queryKey: ["/api/files"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/files", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setModalOpen(false);
      toast({
        title: "Client added",
        description: "The client has been added to your queue.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/files/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setModalOpen(false);
      setEditingFile(null);
      toast({
        title: "Client updated",
        description: "The client details have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/files/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Client removed",
        description: "The client has been removed from your queue.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const touchMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/files/${id}/touch`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "File touched",
        description: "The timer has been reset for this client.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to touch file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedFiles: ClientFile[]) => {
      return await apiRequest("POST", "/api/files/reorder", { files: reorderedFiles });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingFile) {
      updateMutation.mutate({ id: editingFile.id, data });
    } else {
      const maxPosition = files.length > 0 ? Math.max(...files.map(f => f.queuePosition)) : -1;
      createMutation.mutate({ ...data, queuePosition: maxPosition + 1 });
    }
  };

  const handleEdit = (file: ClientFile) => {
    setEditingFile(file);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingFile(null);
    setModalOpen(true);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sortedFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedFiles = items.map((file, index) => ({
      ...file,
      queuePosition: index,
    }));

    queryClient.setQueryData(["/api/files"], reorderedFiles);
    reorderMutation.mutate(reorderedFiles);
  };

  const sortedFiles = [...files].sort((a, b) => a.queuePosition - b.queuePosition);
  
  const stats = {
    total: files.length,
    waiting: files.filter(f => f.status === "waiting").length,
    inProgress: files.filter(f => f.status === "in_progress").length,
    completed: files.filter(f => f.status === "completed").length,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
                Client Queue
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and prioritize your daily client work
              </p>
            </div>
            <Button onClick={handleAddNew} data-testid="button-add-client">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Clients"
            value={stats.total}
            icon={Users}
            testId="stat-total"
          />
          <StatsCard
            title="Waiting"
            value={stats.waiting}
            icon={Clock}
            testId="stat-waiting"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={AlertCircle}
            testId="stat-in-progress"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            testId="stat-completed"
          />
        </div>

        {sortedFiles.length === 0 ? (
          <EmptyState onAddClient={handleAddNew} />
        ) : (
          <div className="overflow-x-auto overflow-y-visible pb-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="queue-list" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex gap-4 min-w-max"
                    data-testid="queue-list"
                    style={{ width: `${sortedFiles.length * 336}px` }}
                  >
                    {sortedFiles.map((file, index) => (
                      <Draggable key={file.id} draggableId={String(file.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <QueueItem
                              file={file}
                              onTouch={touchMutation.mutate}
                              onEdit={handleEdit}
                              onDelete={deleteMutation.mutate}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </main>

      <AddEditClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        editingFile={editingFile}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
