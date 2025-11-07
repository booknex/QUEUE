import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Clock, Users, CheckCircle2, AlertCircle, ChevronDown, Building2, Settings, Phone } from "lucide-react";
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
import { TouchNoteModal } from "@/components/TouchNoteModal";
import { PhoneWidget } from "@/components/PhoneWidget";
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
  const [touchNoteModalOpen, setTouchNoteModalOpen] = useState(false);
  const [touchingFile, setTouchingFile] = useState<ClientFile | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(() => {
    const saved = localStorage.getItem('selectedPipelineId');
    return saved ? parseInt(saved) : null;
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(() => {
    const saved = localStorage.getItem('selectedCompanyId');
    return saved ? parseInt(saved) : null;
  });
  const { toast } = useToast();

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  useEffect(() => {
    if (companies.length > 0 && selectedCompanyId === null) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Save selected company to localStorage
  useEffect(() => {
    if (selectedCompanyId !== null) {
      localStorage.setItem('selectedCompanyId', selectedCompanyId.toString());
    }
  }, [selectedCompanyId]);

  // Save selected pipeline to localStorage
  useEffect(() => {
    if (selectedPipelineId !== null) {
      localStorage.setItem('selectedPipelineId', selectedPipelineId.toString());
    }
  }, [selectedPipelineId]);

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
      // Try to restore from localStorage first
      const savedPipelineId = localStorage.getItem('selectedPipelineId');
      if (savedPipelineId) {
        const pipelineId = parseInt(savedPipelineId);
        // Check if the saved pipeline still exists in current pipelines
        const pipelineExists = pipelines.some(p => p.id === pipelineId);
        if (pipelineExists) {
          setSelectedPipelineId(pipelineId);
          return;
        }
      }
      // Otherwise default to first pipeline
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
    mutationFn: async ({ id, note }: { id: number; note?: string }) => {
      return await apiRequest("POST", `/api/files/${id}/touch`, { notes: note || "" });
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

  const handleTouch = (file: ClientFile) => {
    setTouchingFile(file);
    setTouchNoteModalOpen(true);
  };

  const handleTouchSubmit = (note: string) => {
    if (touchingFile) {
      touchMutation.mutate({ id: touchingFile.id, note });
      setTouchNoteModalOpen(false);
      setTouchingFile(null);
    }
  };
  
  // Helper function to calculate urgency state for a status
  const getStatusUrgency = (statusFiles: ClientFile[]): "red" | "green" | "neutral" => {
    if (statusFiles.length === 0) return "green";
    
    let hasRed = false;
    let allGreen = true;
    
    for (const file of statusFiles) {
      // Calculate time since last touch or creation
      const referenceTime = file.lastTouchedAt ? new Date(file.lastTouchedAt).getTime() : new Date(file.createdAt).getTime();
      const hoursSince = (now - referenceTime) / (1000 * 60 * 60);
      
      // Check urgency based on elapsed time
      if (hoursSince >= 48) {
        hasRed = true;
        allGreen = false;
      } else if (hoursSince >= 24) {
        allGreen = false;
      }
    }
    
    if (hasRed) return "red";
    if (allGreen) return "green";
    return "neutral";
  };
  
  // Filter out closed files from main queue
  const openFiles = files.filter(f => f.closedAt === null);
  
  // Apply status filter if active
  const filteredFiles = statusFilter 
    ? openFiles.filter(f => f.status === statusFilter)
    : openFiles;
  
  // Sort files by wait time (longest wait first)
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    // Calculate elapsed time for each file
    const aReferenceTime = a.lastTouchedAt ? new Date(a.lastTouchedAt).getTime() : new Date(a.createdAt).getTime();
    const bReferenceTime = b.lastTouchedAt ? new Date(b.lastTouchedAt).getTime() : new Date(b.createdAt).getTime();
    
    const aElapsed = now - aReferenceTime;
    const bElapsed = now - bReferenceTime;
    
    // Sort by elapsed time descending (longest wait first)
    return bElapsed - aElapsed;
  });

  const stats = {
    total: openFiles.length,
    approvedWithConditions: openFiles.filter(f => f.status === "APPROVED W/ CONDITIONS").length,
    preApproved: openFiles.filter(f => f.status === "PRE-APPROVED").length,
    appIntake: openFiles.filter(f => f.status === "APP-INTAKE").length,
    needsLender: openFiles.filter(f => f.status === "NEEDS LENDER").length,
    completed: files.filter(f => f.closedAt !== null).length,
  };
  
  // Calculate urgency for each status
  const urgencies = {
    all: getStatusUrgency(openFiles),
    needsLender: getStatusUrgency(openFiles.filter(f => f.status === "NEEDS LENDER")),
    appIntake: getStatusUrgency(openFiles.filter(f => f.status === "APP-INTAKE")),
    preApproved: getStatusUrgency(openFiles.filter(f => f.status === "PRE-APPROVED")),
    approvedWithConditions: getStatusUrgency(openFiles.filter(f => f.status === "APPROVED W/ CONDITIONS")),
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
            <div className="flex items-center gap-2">
              <PhoneWidget selectedCompanyId={selectedCompanyId} />
              <Button onClick={handleAddNew} data-testid="button-add-client">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard
            title="ALL DEALS"
            value={stats.total}
            icon={Users}
            testId="stat-all-deals"
            onClick={() => setStatusFilter(null)}
            urgencyState={urgencies.all}
          />
          <StatsCard
            title="NEEDS LENDER"
            value={stats.needsLender}
            icon={AlertCircle}
            testId="stat-needs-lender"
            onClick={() => setStatusFilter(statusFilter === "NEEDS LENDER" ? null : "NEEDS LENDER")}
            urgencyState={urgencies.needsLender}
          />
          <StatsCard
            title="APP-INTAKE"
            value={stats.appIntake}
            icon={Clock}
            testId="stat-app-intake"
            onClick={() => setStatusFilter(statusFilter === "APP-INTAKE" ? null : "APP-INTAKE")}
            urgencyState={urgencies.appIntake}
          />
          <StatsCard
            title="PRE-APPROVED"
            value={stats.preApproved}
            icon={AlertCircle}
            testId="stat-pre-approved"
            onClick={() => setStatusFilter(statusFilter === "PRE-APPROVED" ? null : "PRE-APPROVED")}
            urgencyState={urgencies.preApproved}
          />
          <StatsCard
            title="APPROVED W/ CONDITIONS"
            value={stats.approvedWithConditions}
            icon={CheckCircle2}
            testId="stat-approved-conditions"
            onClick={() => setStatusFilter(statusFilter === "APPROVED W/ CONDITIONS" ? null : "APPROVED W/ CONDITIONS")}
            urgencyState={urgencies.approvedWithConditions}
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            testId="stat-completed"
            onClick={() => setClosedFilesModalOpen(true)}
          />
        </div>

        {sortedFiles.length === 0 ? (
          <div className="mb-8">
            <EmptyState onAddClient={handleAddNew} />
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible pb-4 -mx-6 px-6 mb-8">
            <div
              className="flex gap-4 min-w-max"
              data-testid="queue-list"
            >
              {sortedFiles.map((file) => (
                <QueueItem
                  key={file.id}
                  file={file}
                  pipelines={pipelines}
                  onTouch={handleTouch}
                  onEdit={handleEdit}
                  onDelete={deleteMutation.mutate}
                  onClose={handleClose}
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
        pipelines={pipelines}
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
        pipelines={pipelines}
        onTouch={handleTouch}
        onEdit={handleEdit}
        onDelete={deleteMutation.mutate}
        onClose={handleClose}
        now={now}
      />

      <TouchNoteModal
        file={touchingFile}
        open={touchNoteModalOpen}
        onOpenChange={setTouchNoteModalOpen}
        onSubmit={handleTouchSubmit}
      />

      <CompanyManager
        open={companyManagerOpen}
        onClose={() => setCompanyManagerOpen(false)}
      />
    </div>
  );
}
