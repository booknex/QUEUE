import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Clock, Users, CheckCircle2, AlertCircle, ChevronDown, Building2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QueueItem } from "@/components/QueueItem";
import { KanbanView } from "@/components/KanbanView";
import { AddEditClientModal } from "@/components/AddEditClientModal";
import { CloseFileModal } from "@/components/CloseFileModal";
import { ClosedFilesModal } from "@/components/ClosedFilesModal";
import { CompanyManager } from "@/components/CompanyManager";
import { StatsCard } from "@/components/StatsCard";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ClientFile, KanbanColumn, Pipeline, Company } from "@shared/schema";

function parseClientFileDates(file: any): ClientFile {
  return {
    ...file,
    createdAt: new Date(file.createdAt),
    lastTouchedAt: file.lastTouchedAt ? new Date(file.lastTouchedAt) : null,
    closedAt: file.closedAt ? new Date(file.closedAt) : null,
  };
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<ClientFile | null>(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closingFile, setClosingFile] = useState<ClientFile | null>(null);
  const [closedFilesModalOpen, setClosedFilesModalOpen] = useState(false);
  const [companyManagerOpen, setCompanyManagerOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  useEffect(() => {
    if (companies.length > 0 && selectedCompanyId === null) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Reset pipeline selection when company changes
  useEffect(() => {
    setSelectedPipelineId(null);
  }, [selectedCompanyId]);

  const { data: files = [], isLoading } = useQuery<ClientFile[]>({
    queryKey: ["/api/files", selectedCompanyId?.toString()],
    queryFn: async () => {
      if (selectedCompanyId === null) return [];
      const response = await fetch(`/api/files?companyId=${selectedCompanyId}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      return response.json();
    },
    select: (data: any[]) => data.map(parseClientFileDates),
    enabled: selectedCompanyId !== null,
  });

  const { data: pipelines = [] } = useQuery<Pipeline[]>({
    queryKey: ["/api/pipelines", selectedCompanyId?.toString()],
    queryFn: async () => {
      if (selectedCompanyId === null) return [];
      const response = await fetch(`/api/pipelines?companyId=${selectedCompanyId}`);
      if (!response.ok) throw new Error("Failed to fetch pipelines");
      return response.json();
    },
    enabled: selectedCompanyId !== null,
  });

  useEffect(() => {
    if (pipelines.length > 0 && selectedPipelineId === null) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines, selectedPipelineId]);

  const { data: pipelineColumns = [] } = useQuery<KanbanColumn[]>({
    queryKey: ["/api/columns", selectedPipelineId?.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/columns?pipelineId=${selectedPipelineId}`);
      if (!response.ok) throw new Error("Failed to fetch columns");
      return response.json();
    },
    enabled: selectedPipelineId !== null,
  });


  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/files", { ...data, companyId: selectedCompanyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", selectedCompanyId?.toString()] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/files", selectedCompanyId?.toString()] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/files", selectedCompanyId?.toString()] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/files", selectedCompanyId?.toString()] });
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

  const closeMutation = useMutation({
    mutationFn: async ({ id, closedAt }: { id: number; closedAt: string }) => {
      return await apiRequest("POST", `/api/files/${id}/close`, { closedAt });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/files", selectedCompanyId?.toString()] });
      setCloseModalOpen(false);
      setClosingFile(null);
      toast({
        title: "File closed",
        description: "The client file has been closed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to close file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pipelineAssignMutation = useMutation({
    mutationFn: async ({ id, pipelineId }: { id: number; pipelineId: number | null }) => {
      return await apiRequest("PATCH", `/api/files/${id}`, { pipelineId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", selectedCompanyId?.toString()] });
      toast({
        title: "Pipeline updated",
        description: "The client has been assigned to the pipeline.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign pipeline. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingFile) {
      updateMutation.mutate({ id: editingFile.id, data });
    } else {
      createMutation.mutate(data);
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

  const handleClose = (file: ClientFile) => {
    setClosingFile(file);
    setCloseModalOpen(true);
  };

  const handleCloseSubmit = (data: { closedAt: string }) => {
    if (closingFile) {
      closeMutation.mutate({ id: closingFile.id, closedAt: data.closedAt });
    }
  };

  const handlePipelineChange = (fileId: number, pipelineId: number | null) => {
    pipelineAssignMutation.mutate({ id: fileId, pipelineId });
  };
  
  const stats = {
    total: files.length,
    waiting: files.filter(f => f.status === "waiting").length,
    inProgress: files.filter(f => f.status === "in_progress").length,
    completed: files.filter(f => f.closedAt !== null).length,
  };

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    const dataInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", selectedCompanyId?.toString()] });
    }, 30000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(dataInterval);
    };
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
      <header className="bg-background border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
                Client Queue
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and prioritize your daily client work
              </p>
              <div className="mt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-64"
                      data-testid="button-company-dropdown"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      {companies.find((c) => c.id === selectedCompanyId)?.name || "Select Company"}
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64" data-testid="menu-company-dropdown">
                    {companies.map((company) => (
                      <DropdownMenuItem
                        key={company.id}
                        onClick={() => setSelectedCompanyId(company.id)}
                        data-testid={`menu-item-company-${company.id}`}
                      >
                        {company.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setCompanyManagerOpen(true)}
                      data-testid="menu-item-manage-companies"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Companies
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Button onClick={handleAddNew} data-testid="button-add-client">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
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
            onClick={() => setClosedFilesModalOpen(true)}
          />
        </div>

        {files.length === 0 ? (
          <div className="mb-8">
            <EmptyState onAddClient={handleAddNew} />
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible pb-4 -mx-6 px-6 mb-8">
            <div
              className="flex gap-4 min-w-max"
              data-testid="queue-list"
            >
              {files.map((file) => (
                <QueueItem
                  key={file.id}
                  file={file}
                  pipelines={pipelines}
                  onTouch={touchMutation.mutate}
                  onEdit={handleEdit}
                  onDelete={deleteMutation.mutate}
                  onClose={handleClose}
                  onPipelineChange={handlePipelineChange}
                  now={now}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <KanbanView 
            selectedPipelineId={selectedPipelineId}
            onPipelineChange={setSelectedPipelineId}
            selectedCompanyId={selectedCompanyId}
          />
        </div>
      </main>

      <AddEditClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        editingFile={editingFile}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <CloseFileModal
        open={closeModalOpen}
        onOpenChange={setCloseModalOpen}
        onSubmit={handleCloseSubmit}
        file={closingFile}
        isPending={closeMutation.isPending}
      />

      <ClosedFilesModal
        open={closedFilesModalOpen}
        onOpenChange={setClosedFilesModalOpen}
        files={files}
      />

      <CompanyManager
        open={companyManagerOpen}
        onClose={() => setCompanyManagerOpen(false)}
      />
    </div>
  );
}
