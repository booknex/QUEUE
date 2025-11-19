import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
  DialogPortal,
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
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isTouchesOpen, setIsTouchesOpen] = useState(false);
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
      setIsNotesOpen(false);
      setIsTouchesOpen(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        {/* Left Sliding Panel - Behind Modal (z-[45]) */}
        {open && (
          <aside
            className={cn(
              "fixed top-1/2 -translate-y-1/2 w-80 max-h-[90vh] bg-background border rounded-md shadow-xl transition-all duration-300 ease-in-out z-[45] overflow-hidden",
              isNotesOpen ? "left-[calc(50%-32rem-1.25rem)]" : "left-[calc(50%-32rem-21rem)]"
            )}
          >
            <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">
                Meeting Notes {editingFile && meetingNotes.length > 0 && `(${meetingNotes.length})`}
              </h3>
            </div>
            <ScrollArea className="flex-1">
              {!editingFile ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  Save first to view notes.
                </div>
              ) : isLoadingMeetingNotes ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  Loading...
                </div>
              ) : meetingNotes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  No notes yet.
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {meetingNotes.map((note) => (
                    <div
                      key={note.id}
                      className="border rounded-md p-2 bg-card text-xs"
                      data-testid={`meeting-note-${note.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-muted-foreground" data-testid={`meeting-note-time-${note.id}`}>
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(note.id, "meeting-note")}
                          data-testid={`button-delete-meeting-note-${note.id}`}
                          className="h-5 w-5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {note.notes && (
                        <p className="text-foreground whitespace-pre-wrap" data-testid={`meeting-note-content-${note.id}`}>
                          {note.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </aside>
      )}

        {/* Right Sliding Panel - Behind Modal (z-[45]) */}
        {open && (
          <aside
            className={cn(
              "fixed top-1/2 -translate-y-1/2 w-80 max-h-[90vh] bg-background border rounded-md shadow-xl transition-all duration-300 ease-in-out z-[45] overflow-hidden",
              isTouchesOpen ? "right-[calc(50%-32rem-1.25rem)]" : "right-[calc(50%-32rem-21rem)]"
            )}
          >
            <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">
                Touch Comments {editingFile && workSessions.length > 0 && `(${workSessions.length})`}
              </h3>
            </div>
            <ScrollArea className="flex-1">
              {!editingFile ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  Save first to view comments.
                </div>
              ) : isLoadingSessions ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  Loading...
                </div>
              ) : workSessions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  No comments yet.
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {workSessions.map((session) => {
                    const displayName = session.userFirstName && session.userLastName
                      ? `${session.userFirstName} ${session.userLastName}`
                      : session.userName || "Unknown User";
                    
                    return (
                      <div
                        key={session.id}
                        className="border rounded-md p-2 bg-card text-xs"
                        data-testid={`touch-comment-${session.id}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <p className="text-muted-foreground" data-testid={`touch-comment-time-${session.id}`}>
                              {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                            </p>
                            <span>•</span>
                            <p className="font-medium" data-testid={`touch-comment-user-${session.id}`}>
                              {displayName}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(session.id, "session")}
                            data-testid={`button-delete-touch-comment-${session.id}`}
                            className="h-5 w-5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {session.notes && (
                          <p className="text-foreground whitespace-pre-wrap" data-testid={`touch-comment-content-${session.id}`}>
                            {session.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </aside>
      )}

        {/* Main Modal Dialog Content (z-50 - Above panels) */}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" data-testid="modal-add-edit-client">
        {/* Edge Trigger Buttons - Aligned with Title */}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsNotesOpen(!isNotesOpen)}
          className="absolute left-6 top-6 z-50"
          data-testid="button-toggle-meeting-notes"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsTouchesOpen(!isTouchesOpen)}
          className="absolute right-16 top-6 z-50"
          data-testid="button-toggle-touch-comments"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <DialogHeader className="pl-10 pr-10">
          <DialogTitle data-testid="text-modal-title">
            {editingFile ? "Edit Client File" : "Add New Client"}
          </DialogTitle>
          <DialogDescription data-testid="text-modal-description">
            {editingFile
              ? "Update the client details below."
              : "Add a new client to your work queue."}
          </DialogDescription>
        </DialogHeader>

        {/* Details Form */}
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
              <div className="space-y-2 max-h-[calc(90vh-12rem)] overflow-auto pr-2">
                <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Contact Information</h4>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="clientName"
                          render={({ field }) => (
                            <FormItem className="flex flex-col relative" ref={dropdownRef}>
                              <FormLabel className="text-xs">Client Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Start typing client name..."
                                  data-testid="input-client-name"
                                  className="h-8"
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
                              <FormLabel className="text-xs">Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  placeholder="Enter phone number..."
                                  data-testid="input-phone"
                                  className="h-8"
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
                              <FormLabel className="text-xs">Email</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  type="email"
                                  placeholder="Enter email address..."
                                  data-testid="input-email"
                                  className="h-8"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Dashboard Display</h4>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Meeting notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Add notes from your meeting or work session"
                                  className="min-h-14 resize-none text-sm"
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
                              <FormLabel className="text-xs">Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                                disabled={isLoadingFilters}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-status" className="h-8">
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
                              <FormLabel className="text-xs">Pipeline</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                                value={field.value ? String(field.value) : "none"}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-pipeline" className="h-8">
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

                <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
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
              </div>
            </form>
          </Form>
        </div>
        </DialogContent>
      </DialogPortal>
      </Dialog>

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
    </>
  );
}
