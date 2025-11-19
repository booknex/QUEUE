import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ClientFile, Pipeline, StatusFilter, WorkSessionWithUser, MeetingNote, Contact } from "@shared/schema";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
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
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"meeting-note" | "session" | null>(null);
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const { data: companyContacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", companyId?.toString()],
    queryFn: async () => {
      if (companyId === null) return [];
      const response = await fetch(`/api/contacts?companyId=${companyId}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
    enabled: companyId !== null && open,
  });

  const { data: workSessions = [], isLoading: isLoadingSessions } = useQuery<WorkSessionWithUser[]>({
    queryKey: ["/api/files", editingFile?.id, "sessions"],
    queryFn: async () => {
      if (!editingFile?.id) return [];
      const response = await fetch(`/api/files/${editingFile.id}/sessions`);
      if (!response.ok) throw new Error("Failed to fetch work sessions");
      return response.json();
    },
    enabled: !!editingFile?.id && open,
  });

  const { data: meetingNotes = [], isLoading: isLoadingMeetingNotes } = useQuery<MeetingNote[]>({
    queryKey: ["/api/files", editingFile?.id, "meeting-notes"],
    queryFn: async () => {
      if (!editingFile?.id) return [];
      const response = await fetch(`/api/files/${editingFile.id}/meeting-notes`);
      if (!response.ok) throw new Error("Failed to fetch meeting notes");
      return response.json();
    },
    enabled: !!editingFile?.id && open,
  });

  const deleteMeetingNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/meeting-notes/${id}`, {});
    },
    onSuccess: () => {
      if (editingFile?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/files", editingFile.id, "meeting-notes"] });
      }
      toast({
        title: "Meeting note deleted",
        description: "The meeting note has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete meeting note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/sessions/${id}`, {});
    },
    onSuccess: () => {
      if (editingFile?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/files", editingFile.id, "sessions"] });
      }
      toast({
        title: "Touch comment deleted",
        description: "The touch comment has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete touch comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number, type: "meeting-note" | "session") => {
    setDeletingId(id);
    setDeleteType(type);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingId === null || deleteType === null) return;
    
    if (deleteType === "meeting-note") {
      deleteMeetingNoteMutation.mutate(deletingId);
    } else {
      deleteSessionMutation.mutate(deletingId);
    }
    
    setDeleteConfirmOpen(false);
    setDeletingId(null);
    setDeleteType(null);
  };

  // Preserve the order from the API (sorted by position) instead of alphabetically sorting
  const sortedFilters = [...filters].sort((a, b) => a.position - b.position);
  const uniqueStatuses = Array.from(new Set(sortedFilters.map(f => f.name)));
  const defaultStatus = uniqueStatuses.length > 0 ? uniqueStatuses[0] : "";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      phone: "",
      email: "",
      description: "",
      status: defaultStatus,
      pipelineId: null,
    },
  });

  useEffect(() => {
    if (editingFile) {
      form.reset({
        clientName: editingFile.clientName,
        phone: editingFile.phone || "",
        email: editingFile.email || "",
        description: editingFile.description || "",
        status: editingFile.status,
        pipelineId: editingFile.pipelineId || null,
      });
    } else {
      form.reset({
        clientName: "",
        phone: "",
        email: "",
        description: "",
        status: defaultStatus,
        pipelineId: null,
      });
    }
  }, [editingFile, form, defaultStatus]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContactId(contact.id);
    form.setValue("clientName", contact.name);
    form.setValue("phone", contact.phone || "");
    form.setValue("email", contact.email || "");
    setContactSearchOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setContactSearchOpen(false);
      }
    };

    if (contactSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [contactSearchOpen]);

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      form.reset();
      setContactSearchOpen(false);
      setSelectedContactId(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] w-full sm:top-[5%] sm:translate-y-0 max-h-[90vh]" data-testid="modal-add-edit-client">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              Meeting Notes {editingFile && meetingNotes.length > 0 && `(${meetingNotes.length})`}
            </h3>
            <ScrollArea className="h-[500px] pr-4 border rounded-md p-4">
              {!editingFile ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Save the client first to view meeting notes.
                </div>
              ) : isLoadingMeetingNotes ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Loading meeting notes...
                </div>
              ) : meetingNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No meeting notes yet. Update the client with meeting notes to create history.
                </div>
              ) : (
                <div className="space-y-3">
                  {meetingNotes.map((note) => (
                    <div
                      key={note.id}
                      className="border rounded-md p-3 bg-card"
                      data-testid={`meeting-note-${note.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground" data-testid={`meeting-note-time-${note.id}`}>
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(note.id, "meeting-note")}
                          data-testid={`button-delete-meeting-note-${note.id}`}
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                      {note.notes ? (
                        <p className="text-sm text-foreground whitespace-pre-wrap" data-testid={`meeting-note-content-${note.id}`}>
                          {note.notes}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No notes added</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="space-y-3 flex flex-col">
            <h3 className="text-sm font-semibold">Details</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-3 flex-1">
                <ScrollArea className="h-[500px] border rounded-md">
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">Contact Information</h4>
                      <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col relative" ref={dropdownRef}>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Start typing client name..."
                              data-testid="input-client-name"
                              onFocus={() => {
                                if (field.value && companyContacts.length > 0) {
                                  setContactSearchOpen(true);
                                }
                              }}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                setSelectedContactId(null);
                                setContactSearchOpen(e.target.value.length > 0 && companyContacts.length > 0);
                              }}
                            />
                          </FormControl>
                          {contactSearchOpen && companyContacts.filter(contact => 
                            contact.name.toLowerCase().includes((field.value || "").toLowerCase())
                          ).length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                              {companyContacts
                                .filter(contact => 
                                  contact.name.toLowerCase().includes((field.value || "").toLowerCase())
                                )
                                .map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="relative flex cursor-pointer select-none items-start gap-2 px-3 py-2.5 hover-elevate"
                                    onClick={() => handleContactSelect(contact)}
                                    data-testid={`contact-option-${contact.id}`}
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4 mt-0.5 shrink-0",
                                        selectedContactId === contact.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                      <span className="font-medium text-sm">{contact.name}</span>
                                      {(contact.phone || contact.email) && (
                                        <span className="text-xs text-muted-foreground">
                                          {[contact.phone, contact.email].filter(Boolean).join(" • ")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="Enter phone number..."
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              type="email"
                              placeholder="Enter email address..."
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">Dashboard Display</h4>
                      <div className="space-y-4">
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
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="flex justify-end gap-2">
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
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              Touch Comments {editingFile && workSessions.length > 0 && `(${workSessions.length})`}
            </h3>
            <ScrollArea className="h-[500px] pr-4 border rounded-md p-4">
              {!editingFile ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Save the client first to view touch comments.
                </div>
              ) : isLoadingSessions ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Loading touch comments...
                </div>
              ) : workSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No touch comments yet. Touch this client to add comments.
                </div>
              ) : (
                <div className="space-y-3">
                  {workSessions.map((session) => {
                    const displayName = session.userFirstName && session.userLastName
                      ? `${session.userFirstName} ${session.userLastName}`
                      : session.userName || "Unknown User";
                    
                    return (
                      <div
                        key={session.id}
                        className="border rounded-md p-3 bg-card"
                        data-testid={`touch-comment-${session.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-muted-foreground" data-testid={`touch-comment-time-${session.id}`}>
                              {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                            </p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <p className="text-xs font-medium text-foreground" data-testid={`touch-comment-user-${session.id}`}>
                              {displayName}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(session.id, "session")}
                            data-testid={`button-delete-touch-comment-${session.id}`}
                            className="h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(session.startedAt).toLocaleString()}
                        </p>
                        {session.notes ? (
                          <p className="text-sm text-foreground whitespace-pre-wrap" data-testid={`touch-comment-content-${session.id}`}>
                            {session.notes}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No comment added</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "meeting-note" 
                ? "This will permanently delete this meeting note from the history."
                : "This will permanently delete this touch comment from the history."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
