import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ClientFile, Pipeline, StatusFilter, WorkSession } from "@shared/schema";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  pipelineId: z.number().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddEditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  editingFile: ClientFile | null;
  isPending: boolean;
  pipelines: Pipeline[];
  companyId: number | null;
}

export function AddEditClientModal({
  open,
  onOpenChange,
  onSubmit,
  editingFile,
  isPending,
  pipelines,
  companyId,
}: AddEditClientModalProps) {
  const { data: filters = [], isLoading: isLoadingFilters } = useQuery<StatusFilter[]>({
    queryKey: ["/api/filters", companyId?.toString()],
    queryFn: async () => {
      if (companyId === null) return [];
      const response = await fetch(`/api/filters?companyId=${companyId}`);
      if (!response.ok) throw new Error("Failed to fetch filters");
      return response.json();
    },
    enabled: companyId !== null,
  });

  const { data: workSessions = [], isLoading: isLoadingSessions } = useQuery<WorkSession[]>({
    queryKey: ["/api/files", editingFile?.id, "sessions"],
    queryFn: async () => {
      if (!editingFile?.id) return [];
      const response = await fetch(`/api/files/${editingFile.id}/sessions`);
      if (!response.ok) throw new Error("Failed to fetch work sessions");
      return response.json();
    },
    enabled: !!editingFile?.id && open,
  });

  // Preserve the order from the API (sorted by position) instead of alphabetically sorting
  const sortedFilters = [...filters].sort((a, b) => a.position - b.position);
  const uniqueStatuses = Array.from(new Set(sortedFilters.map(f => f.name)));
  const defaultStatus = uniqueStatuses.length > 0 ? uniqueStatuses[0] : "";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      description: "",
      status: defaultStatus,
      pipelineId: null,
    },
  });

  useEffect(() => {
    if (editingFile) {
      form.reset({
        clientName: editingFile.clientName,
        description: editingFile.description || "",
        status: editingFile.status,
        pipelineId: editingFile.pipelineId || null,
      });
    } else {
      form.reset({
        clientName: "",
        description: "",
        status: defaultStatus,
        pipelineId: null,
      });
    }
  }, [editingFile, form, defaultStatus]);

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl sm:top-[10%] sm:translate-y-0 max-h-[85vh]" data-testid="modal-add-edit-client">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {editingFile ? "Edit Client File" : "Add New Client"}
          </DialogTitle>
          <DialogDescription data-testid="text-modal-description">
            {editingFile
              ? "Update the client details below."
              : "Add a new client to your work queue."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
            <TabsTrigger value="notes" disabled={!editingFile} data-testid="tab-notes">
              Notes History {editingFile && workSessions.length > 0 && `(${workSessions.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter client name"
                      {...field}
                      data-testid="input-client-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes from your meeting or work session"
                      className="min-h-24 resize-none"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isLoadingFilters}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder={isLoadingFilters ? "Loading statuses..." : "Select status"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {uniqueStatuses.length > 0 ? (
                        uniqueStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-status" disabled>
                          No statuses available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pipelineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pipeline</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                    value={field.value ? String(field.value) : "none"}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-pipeline">
                        <SelectValue placeholder="Select pipeline (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Pipeline</SelectItem>
                      {pipelines.map((pipeline) => (
                        <SelectItem key={pipeline.id} value={String(pipeline.id)}>
                          {pipeline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isPending}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} data-testid="button-submit">
                    {isPending ? "Saving..." : editingFile ? "Update" : "Add Client"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoadingSessions ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading notes history...
                </div>
              ) : workSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No meeting notes yet. Touch this client to add notes.
                </div>
              ) : (
                <div className="space-y-4">
                  {workSessions.map((session) => (
                    <div
                      key={session.id}
                      className="border rounded-md p-4 bg-card"
                      data-testid={`note-${session.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground" data-testid={`note-time-${session.id}`}>
                          {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.startedAt).toLocaleString()}
                        </p>
                      </div>
                      {session.notes ? (
                        <p className="text-sm text-foreground whitespace-pre-wrap" data-testid={`note-content-${session.id}`}>
                          {session.notes}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No notes added</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
