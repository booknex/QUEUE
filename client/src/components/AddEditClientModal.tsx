import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useRef, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Check, ChevronLeft, ChevronRight, MoreVertical, Square, CheckSquare, Pencil } from "lucide-react";
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
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ClientFile, Pipeline, StatusFilter, WorkSessionWithUser, MeetingNote, Contact } from "@shared/schema";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  pipelineId: z.number().nullable().optional(),
  loanType: z.string().optional(),
  interestRate: z.string().optional(),
  occupancy: z.string().optional(),
  loanPurpose: z.string().optional(),
  propertyValue: z.string().optional(),
  purchasePrice: z.string().optional(),
  ltvPayoffAmount: z.string().optional(),
  fileClosing: z.string().optional(),
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

export const AddEditClientModal = memo(function AddEditClientModal({
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
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editSessionNotes, setEditSessionNotes] = useState("");
  const [editingMeetingNoteId, setEditingMeetingNoteId] = useState<number | null>(null);
  const [editMeetingNoteText, setEditMeetingNoteText] = useState("");
  const [lenderAName, setLenderAName] = useState("");
  const [lenderAContact, setLenderAContact] = useState("");
  const [lenderAPhone, setLenderAPhone] = useState("");
  const [lenderAEmail, setLenderAEmail] = useState("");
  const [lenderANotes, setLenderANotes] = useState("");
  const [lenderATermOffered, setLenderATermOffered] = useState("");
  const [lenderAMinCreditScore, setLenderAMinCreditScore] = useState("");
  const [lenderAMinLoanAmount, setLenderAMinLoanAmount] = useState("");
  const [lenderAHighestLtv, setLenderAHighestLtv] = useState("");
  const [lenderAHighestDti, setLenderAHighestDti] = useState("");
  const [lenderAMaxCashout, setLenderAMaxCashout] = useState("");
  const [lenderAPrepaymentPenalty, setLenderAPrepaymentPenalty] = useState("");
  const [lenderACompensationType, setLenderACompensationType] = useState("");
  const [lenderAFeesForLoan, setLenderAFeesForLoan] = useState("");
  const [lenderBName, setLenderBName] = useState("");
  const [lenderBContact, setLenderBContact] = useState("");
  const [lenderBPhone, setLenderBPhone] = useState("");
  const [lenderBEmail, setLenderBEmail] = useState("");
  const [lenderBNotes, setLenderBNotes] = useState("");
  const [lenderBTermOffered, setLenderBTermOffered] = useState("");
  const [lenderBMinCreditScore, setLenderBMinCreditScore] = useState("");
  const [lenderBMinLoanAmount, setLenderBMinLoanAmount] = useState("");
  const [lenderBHighestLtv, setLenderBHighestLtv] = useState("");
  const [lenderBHighestDti, setLenderBHighestDti] = useState("");
  const [lenderBMaxCashout, setLenderBMaxCashout] = useState("");
  const [lenderBPrepaymentPenalty, setLenderBPrepaymentPenalty] = useState("");
  const [lenderBCompensationType, setLenderBCompensationType] = useState("");
  const [lenderBFeesForLoan, setLenderBFeesForLoan] = useState("");
  const [isLenderEditing, setIsLenderEditing] = useState(false);
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

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return await apiRequest("PATCH", `/api/sessions/${id}`, { notes });
    },
    onSuccess: () => {
      if (editingFile?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/files", editingFile.id, "sessions"] });
      }
      setEditingSessionId(null);
      setEditSessionNotes("");
      toast({
        title: "Touch updated",
        description: "The touch notes have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update touch. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleMeetingNoteMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: number }) => {
      return await apiRequest("PATCH", `/api/meeting-notes/${id}`, { completed });
    },
    onSuccess: () => {
      if (editingFile?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/files", editingFile.id, "meeting-notes"] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update meeting note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMeetingNoteMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return await apiRequest("PATCH", `/api/meeting-notes/${id}`, { notes });
    },
    onSuccess: () => {
      if (editingFile?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/files", editingFile.id, "meeting-notes"] });
      }
      setEditingMeetingNoteId(null);
      setEditMeetingNoteText("");
      toast({
        title: "Meeting note updated",
        description: "The meeting note has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update meeting note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveLenderMutation = useMutation({
    mutationFn: async () => {
      if (!editingFile?.id) return;
      return await apiRequest("PATCH", `/api/files/${editingFile.id}`, {
        lenderAName, lenderAContact, lenderAPhone, lenderAEmail, lenderANotes,
        termOffered: lenderATermOffered, minCreditScore: lenderAMinCreditScore,
        minLoanAmount: lenderAMinLoanAmount, highestLtv: lenderAHighestLtv,
        highestDti: lenderAHighestDti, maxCashout: lenderAMaxCashout,
        prepaymentPenalty: lenderAPrepaymentPenalty, compensationType: lenderACompensationType,
        feesForLoan: lenderAFeesForLoan,
        lenderBName, lenderBContact, lenderBPhone, lenderBEmail, lenderBNotes,
        lenderBTermOffered, lenderBMinCreditScore, lenderBMinLoanAmount,
        lenderBHighestLtv, lenderBHighestDti, lenderBMaxCashout,
        lenderBPrepaymentPenalty, lenderBCompensationType, lenderBFeesForLoan,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({ title: "Lender info saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save lender info.", variant: "destructive" });
    },
  });

  const handleToggleMeetingNote = (note: MeetingNote, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't allow toggle while mutation is pending
    if (toggleMeetingNoteMutation.isPending) return;
    
    const newCompleted = note.completed === 1 ? 0 : 1;
    toggleMeetingNoteMutation.mutate({
      id: note.id,
      completed: newCompleted,
    });
  };

  // Group work sessions by date for display under meeting notes
  const getSessionsForDate = (noteCreatedAt: Date) => {
    const noteDate = new Date(noteCreatedAt);
    noteDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(noteDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return workSessions.filter(session => {
      const sessionDate = new Date(session.startedAt);
      return sessionDate >= noteDate && sessionDate < nextDay;
    });
  };

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

  const handleStartEditSession = (session: WorkSessionWithUser, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditSessionNotes(session.notes || "");
  };

  const handleSaveSessionEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingSessionId === null) return;
    updateSessionMutation.mutate({
      id: editingSessionId,
      notes: editSessionNotes,
    });
  };

  const handleCancelSessionEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSessionId(null);
    setEditSessionNotes("");
  };

  const handleStartEditMeetingNote = (note: MeetingNote, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingMeetingNoteId(note.id);
    setEditMeetingNoteText(note.notes || "");
  };

  const handleSaveMeetingNoteEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingMeetingNoteId === null) return;
    updateMeetingNoteMutation.mutate({
      id: editingMeetingNoteId,
      notes: editMeetingNoteText,
    });
  };

  const handleCancelMeetingNoteEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingMeetingNoteId(null);
    setEditMeetingNoteText("");
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
      loanType: "",
      interestRate: "",
      occupancy: "",
      loanPurpose: "",
      propertyValue: "",
      purchasePrice: "",
      ltvPayoffAmount: "",
      fileClosing: "",
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
        loanType: editingFile.loanType || "",
        interestRate: editingFile.interestRate || "",
        occupancy: editingFile.occupancy || "",
        loanPurpose: editingFile.loanPurpose || "",
        propertyValue: editingFile.propertyValue || "",
        purchasePrice: editingFile.purchasePrice || "",
        ltvPayoffAmount: editingFile.ltvPayoffAmount || "",
        fileClosing: editingFile.fileClosing || "",
      });
    } else {
      form.reset({
        clientName: "",
        phone: "",
        email: "",
        description: "",
        status: defaultStatus,
        pipelineId: null,
        loanType: "",
        interestRate: "",
        occupancy: "",
        loanPurpose: "",
        propertyValue: "",
        purchasePrice: "",
        ltvPayoffAmount: "",
        fileClosing: "",
      });
    }
  }, [editingFile, form, defaultStatus]);

  useEffect(() => {
    if (editingFile) {
      setLenderAName(editingFile.lenderAName || "");
      setLenderAContact(editingFile.lenderAContact || "");
      setLenderAPhone(editingFile.lenderAPhone || "");
      setLenderAEmail(editingFile.lenderAEmail || "");
      setLenderANotes(editingFile.lenderANotes || "");
      setLenderATermOffered(editingFile.termOffered || "");
      setLenderAMinCreditScore(editingFile.minCreditScore || "");
      setLenderAMinLoanAmount(editingFile.minLoanAmount || "");
      setLenderAHighestLtv(editingFile.highestLtv || "");
      setLenderAHighestDti(editingFile.highestDti || "");
      setLenderAMaxCashout(editingFile.maxCashout || "");
      setLenderAPrepaymentPenalty(editingFile.prepaymentPenalty || "");
      setLenderACompensationType(editingFile.compensationType || "");
      setLenderAFeesForLoan(editingFile.feesForLoan || "");
      setLenderBName(editingFile.lenderBName || "");
      setLenderBContact(editingFile.lenderBContact || "");
      setLenderBPhone(editingFile.lenderBPhone || "");
      setLenderBEmail(editingFile.lenderBEmail || "");
      setLenderBNotes(editingFile.lenderBNotes || "");
      setLenderBTermOffered(editingFile.lenderBTermOffered || "");
      setLenderBMinCreditScore(editingFile.lenderBMinCreditScore || "");
      setLenderBMinLoanAmount(editingFile.lenderBMinLoanAmount || "");
      setLenderBHighestLtv(editingFile.lenderBHighestLtv || "");
      setLenderBHighestDti(editingFile.lenderBHighestDti || "");
      setLenderBMaxCashout(editingFile.lenderBMaxCashout || "");
      setLenderBPrepaymentPenalty(editingFile.lenderBPrepaymentPenalty || "");
      setLenderBCompensationType(editingFile.lenderBCompensationType || "");
      setLenderBFeesForLoan(editingFile.lenderBFeesForLoan || "");
    } else {
      setLenderAName(""); setLenderAContact(""); setLenderAPhone(""); setLenderAEmail(""); setLenderANotes("");
      setLenderATermOffered(""); setLenderAMinCreditScore(""); setLenderAMinLoanAmount("");
      setLenderAHighestLtv(""); setLenderAHighestDti(""); setLenderAMaxCashout("");
      setLenderAPrepaymentPenalty(""); setLenderACompensationType(""); setLenderAFeesForLoan("");
      setLenderBName(""); setLenderBContact(""); setLenderBPhone(""); setLenderBEmail(""); setLenderBNotes("");
      setLenderBTermOffered(""); setLenderBMinCreditScore(""); setLenderBMinLoanAmount("");
      setLenderBHighestLtv(""); setLenderBHighestDti(""); setLenderBMaxCashout("");
      setLenderBPrepaymentPenalty(""); setLenderBCompensationType(""); setLenderBFeesForLoan("");
    }
  }, [editingFile]);

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
      setIsLenderEditing(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      {/* Left Sliding Panel - Outside DialogPortal (z-[51] - Above overlay, behind modal) */}
      {open && (
        <aside
          onClick={(e) => {
            e.stopPropagation();
            setIsNotesOpen(!isNotesOpen);
          }}
          className={cn(
            "fixed top-8 w-[36rem] h-[400px] bg-background border rounded-md shadow-xl transition-all duration-300 ease-in-out z-[51] overflow-hidden cursor-pointer pointer-events-auto",
            isNotesOpen ? "left-[calc(50%-62rem)]" : "left-[calc(50%-38rem)]"
          )}
          data-testid="panel-meeting-notes"
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
                <div className="space-y-3 pr-2">
                  {meetingNotes.map((note) => {
                    const sessionsForNote = getSessionsForDate(note.createdAt);
                    const isCompleted = note.completed === 1;
                    const isEditingNote = editingMeetingNoteId === note.id;
                    
                    return (
                      <div
                        key={note.id}
                        className={cn(
                          "border rounded-md p-2 bg-card text-xs",
                          isCompleted && "opacity-60"
                        )}
                        data-testid={`meeting-note-${note.id}`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleToggleMeetingNote(note, e)}
                            disabled={toggleMeetingNoteMutation.isPending || isEditingNote}
                            className="mt-0.5 flex-shrink-0 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                            data-testid={`button-toggle-meeting-note-${note.id}`}
                          >
                            {isCompleted ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-muted-foreground" data-testid={`meeting-note-time-${note.id}`}>
                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                              </p>
                              {!isEditingNote && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      data-testid={`button-menu-meeting-note-${note.id}`}
                                      className="h-5 w-5"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => handleStartEditMeetingNote(note, e)}
                                      data-testid={`button-edit-meeting-note-${note.id}`}
                                    >
                                      <Pencil className="h-3 w-3 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(note.id, "meeting-note");
                                      }}
                                      data-testid={`button-delete-meeting-note-${note.id}`}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            {isEditingNote ? (
                              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                <Textarea
                                  value={editMeetingNoteText}
                                  onChange={(e) => setEditMeetingNoteText(e.target.value)}
                                  placeholder="Enter meeting note..."
                                  className="text-xs min-h-[60px]"
                                  data-testid={`input-edit-meeting-note-${note.id}`}
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-6 px-2 text-xs"
                                    onClick={handleSaveMeetingNoteEdit}
                                    disabled={updateMeetingNoteMutation.isPending}
                                    data-testid={`button-save-meeting-note-${note.id}`}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={handleCancelMeetingNoteEdit}
                                    data-testid={`button-cancel-meeting-note-${note.id}`}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : note.notes ? (
                              <p 
                                className={cn(
                                  "text-foreground whitespace-pre-wrap",
                                  isCompleted && "line-through"
                                )} 
                                data-testid={`meeting-note-content-${note.id}`}
                              >
                                {note.notes}
                              </p>
                            ) : null}
                            
                            {sessionsForNote.length > 0 && (
                              <div className="mt-2 pl-2 border-l-2 border-muted space-y-1">
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Touches this day ({sessionsForNote.length})
                                </p>
                                {sessionsForNote.map((session) => {
                                  const displayName = session.userFirstName && session.userLastName
                                    ? `${session.userFirstName} ${session.userLastName}`
                                    : session.userName || "Unknown";
                                  const isEditing = editingSessionId === session.id;
                                  
                                  return (
                                    <div 
                                      key={session.id} 
                                      className="text-[10px] text-muted-foreground group"
                                      data-testid={`session-under-note-${session.id}`}
                                    >
                                      {isEditing ? (
                                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                          <Textarea
                                            value={editSessionNotes}
                                            onChange={(e) => setEditSessionNotes(e.target.value)}
                                            placeholder="Enter touch comment..."
                                            className="text-xs min-h-[80px]"
                                            data-testid={`input-edit-session-${session.id}`}
                                            autoFocus
                                          />
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="default"
                                              className="h-6 px-2 text-xs"
                                              onClick={handleSaveSessionEdit}
                                              disabled={updateSessionMutation.isPending}
                                              data-testid={`button-save-session-${session.id}`}
                                            >
                                              Save
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 px-2 text-xs"
                                              onClick={handleCancelSessionEdit}
                                              data-testid={`button-cancel-session-${session.id}`}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <div className="flex-1">
                                            <span className="font-medium">{displayName}</span>
                                            {session.notes && (
                                              <span className="ml-1">- {session.notes}</span>
                                            )}
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => e.stopPropagation()}
                                                data-testid={`button-menu-session-${session.id}`}
                                              >
                                                <MoreVertical className="h-3 w-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem
                                                onClick={(e) => handleStartEditSession(session, e)}
                                                data-testid={`button-edit-session-${session.id}`}
                                              >
                                                <Pencil className="h-3 w-3 mr-2" />
                                                Edit
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteClick(session.id, "session");
                                                }}
                                                data-testid={`button-delete-session-${session.id}`}
                                                className="text-destructive focus:text-destructive"
                                              >
                                                <Trash2 className="h-3 w-3 mr-2" />
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </aside>
      )}

      {/* Right Sliding Panel - Lender Finder (Outside DialogPortal, same as Meeting Notes) */}
      {open && (
        <aside
          className={cn(
            "fixed top-8 w-[36rem] max-h-[82vh] bg-background border rounded-md shadow-xl transition-all duration-300 ease-in-out z-[51] overflow-hidden pointer-events-auto",
            isTouchesOpen ? "right-[calc(50%-62rem)]" : "right-[calc(50%-38rem)]"
          )}
          data-testid="panel-lender-finder"
        >
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="text-sm font-semibold">Lender Finder</h3>
              {editingFile && (
                <div className="flex items-center gap-2">
                  {isLenderEditing && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={saveLenderMutation.isPending}
                      onClick={() => {
                        saveLenderMutation.mutate();
                        setIsLenderEditing(false);
                      }}
                      data-testid="button-save-lender"
                    >
                      {saveLenderMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={isLenderEditing ? "outline" : "secondary"}
                    onClick={() => setIsLenderEditing(!isLenderEditing)}
                    data-testid="button-toggle-lender-edit"
                  >
                    {isLenderEditing ? "Done" : "Edit"}
                  </Button>
                </div>
              )}
            </div>

            {!editingFile ? (
              <p className="text-xs text-muted-foreground text-center py-4">Save the client first to use Lender Finder.</p>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-2">
                  {/* Lender A */}
                  <div className="border rounded-md p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lender A</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Company / Lender Name</label>
                        <Input
                          value={lenderAName}
                          onChange={(e) => setLenderAName(e.target.value)}
                          readOnly={!isLenderEditing}
                          placeholder="e.g. Wells Fargo"
                          className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")}
                          data-testid="input-lender-a-name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Contact Name</label>
                        <Input
                          value={lenderAContact}
                          onChange={(e) => setLenderAContact(e.target.value)}
                          readOnly={!isLenderEditing}
                          placeholder="e.g. John Smith"
                          className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")}
                          data-testid="input-lender-a-contact"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                        <Input
                          value={lenderAPhone}
                          onChange={(e) => setLenderAPhone(e.target.value)}
                          readOnly={!isLenderEditing}
                          placeholder="(555) 000-0000"
                          className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")}
                          data-testid="input-lender-a-phone"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                        <Input
                          value={lenderAEmail}
                          onChange={(e) => setLenderAEmail(e.target.value)}
                          readOnly={!isLenderEditing}
                          placeholder="email@lender.com"
                          className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")}
                          data-testid="input-lender-a-email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Description / Notes</label>
                      <Textarea
                        value={lenderANotes}
                        onChange={(e) => setLenderANotes(e.target.value)}
                        readOnly={!isLenderEditing}
                        placeholder="Notes about this lender..."
                        className={cn("text-xs resize-none", !isLenderEditing && "bg-muted/50 cursor-default")}
                        rows={3}
                        data-testid="input-lender-a-notes"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Term Offered", placeholder: "e.g. 30 Year", value: lenderATermOffered, set: setLenderATermOffered, testid: "input-lender-a-term-offered" },
                        { label: "Min Credit Score", placeholder: "e.g. 620", value: lenderAMinCreditScore, set: setLenderAMinCreditScore, testid: "input-lender-a-min-credit-score" },
                        { label: "Min Loan Amount", placeholder: "e.g. $100,000", value: lenderAMinLoanAmount, set: setLenderAMinLoanAmount, testid: "input-lender-a-min-loan-amount" },
                        { label: "Highest LTV", placeholder: "e.g. 80%", value: lenderAHighestLtv, set: setLenderAHighestLtv, testid: "input-lender-a-highest-ltv" },
                        { label: "Highest DTI", placeholder: "e.g. 50%", value: lenderAHighestDti, set: setLenderAHighestDti, testid: "input-lender-a-highest-dti" },
                        { label: "MAX Cashout", placeholder: "e.g. $500,000", value: lenderAMaxCashout, set: setLenderAMaxCashout, testid: "input-lender-a-max-cashout" },
                        { label: "Prepayment Penalty", placeholder: "e.g. 3 years", value: lenderAPrepaymentPenalty, set: setLenderAPrepaymentPenalty, testid: "input-lender-a-prepayment-penalty" },
                        { label: "Fees for Loan", placeholder: "e.g. $3,500", value: lenderAFeesForLoan, set: setLenderAFeesForLoan, testid: "input-lender-a-fees-for-loan" },
                      ].map(({ label, placeholder, value, set, testid }) => (
                        <div key={testid}>
                          <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                          <Input value={value} onChange={(e) => set(e.target.value)} readOnly={!isLenderEditing} placeholder={placeholder} className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")} data-testid={testid} />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Compensation</label>
                        <Select value={lenderACompensationType} onValueChange={setLenderACompensationType} disabled={!isLenderEditing}>
                          <SelectTrigger className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")} data-testid="select-lender-a-compensation">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lender-paid">Lender Paid</SelectItem>
                            <SelectItem value="borrower-paid">Borrower Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Lender B */}
                  <div className="border rounded-md p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lender B</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Company / Lender Name</label>
                        <Input
                          value={lenderBName}
                          onChange={(e) => setLenderBName(e.target.value)}
                          readOnly={!isLenderEditing}
                          placeholder="e.g. Chase Bank"
                          className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")}
                          data-testid="input-lender-b-name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Contact Name</label>
                        <Input
                          value={lenderBContact}
                          onChange={(e) => setLenderBContact(e.target.value)}
                          readOnly={!isLenderEditing}
                          placeholder="e.g. Jane Doe"
                          className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")}
                          data-testid="input-lender-b-contact"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                        <Input
                          value={lenderBPhone}
                          onChange={(e) => setLenderBPhone(e.target.value)}
                          readOnly={!isLenderEditing}
                          placeholder="(555) 000-0000"
                          className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")}
                          data-testid="input-lender-b-phone"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                        <Input
                          value={lenderBEmail}
                          onChange={(e) => setLenderBEmail(e.target.value)}
                          readOnly={!isLenderEditing}
                          placeholder="email@lender.com"
                          className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")}
                          data-testid="input-lender-b-email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Description / Notes</label>
                      <Textarea
                        value={lenderBNotes}
                        onChange={(e) => setLenderBNotes(e.target.value)}
                        readOnly={!isLenderEditing}
                        placeholder="Notes about this lender..."
                        className={cn("text-xs resize-none", !isLenderEditing && "bg-muted/50 cursor-default")}
                        rows={3}
                        data-testid="input-lender-b-notes"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Term Offered", placeholder: "e.g. 30 Year", value: lenderBTermOffered, set: setLenderBTermOffered, testid: "input-lender-b-term-offered" },
                        { label: "Min Credit Score", placeholder: "e.g. 620", value: lenderBMinCreditScore, set: setLenderBMinCreditScore, testid: "input-lender-b-min-credit-score" },
                        { label: "Min Loan Amount", placeholder: "e.g. $100,000", value: lenderBMinLoanAmount, set: setLenderBMinLoanAmount, testid: "input-lender-b-min-loan-amount" },
                        { label: "Highest LTV", placeholder: "e.g. 80%", value: lenderBHighestLtv, set: setLenderBHighestLtv, testid: "input-lender-b-highest-ltv" },
                        { label: "Highest DTI", placeholder: "e.g. 50%", value: lenderBHighestDti, set: setLenderBHighestDti, testid: "input-lender-b-highest-dti" },
                        { label: "MAX Cashout", placeholder: "e.g. $500,000", value: lenderBMaxCashout, set: setLenderBMaxCashout, testid: "input-lender-b-max-cashout" },
                        { label: "Prepayment Penalty", placeholder: "e.g. 3 years", value: lenderBPrepaymentPenalty, set: setLenderBPrepaymentPenalty, testid: "input-lender-b-prepayment-penalty" },
                        { label: "Fees for Loan", placeholder: "e.g. $3,500", value: lenderBFeesForLoan, set: setLenderBFeesForLoan, testid: "input-lender-b-fees-for-loan" },
                      ].map(({ label, placeholder, value, set, testid }) => (
                        <div key={testid}>
                          <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                          <Input value={value} onChange={(e) => set(e.target.value)} readOnly={!isLenderEditing} placeholder={placeholder} className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")} data-testid={testid} />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Compensation</label>
                        <Select value={lenderBCompensationType} onValueChange={setLenderBCompensationType} disabled={!isLenderEditing}>
                          <SelectTrigger className={cn("text-xs h-8", !isLenderEditing && "bg-muted/50 cursor-default")} data-testid="select-lender-b-compensation">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lender-paid">Lender Paid</SelectItem>
                            <SelectItem value="borrower-paid">Borrower Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </aside>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogPortal>
        <DialogOverlay className="pointer-events-none" />
        
        {/* Main Modal Dialog Content (z-[52] - Above panels) */}
        <DialogPrimitive.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            "fixed left-[50%] top-8 z-[52] grid w-full max-w-3xl translate-x-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[8] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[8] sm:rounded-lg max-h-[92vh] overflow-hidden pointer-events-auto"
          )}
          data-testid="modal-add-edit-client"
        >
        {/* Header with Title and Arrow Buttons */}
        <div className="flex items-center justify-between mb-6">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            data-testid="button-toggle-meeting-notes"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <DialogTitle data-testid="text-modal-title" className="text-lg font-semibold">
            {editingFile ? "Edit Client File" : "Add New Client"}
          </DialogTitle>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsTouchesOpen(!isTouchesOpen)}
            data-testid="button-toggle-touch-comments"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Details Form */}
        <div>
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

                                              </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Loan Details</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="occupancy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Occupancy</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm" data-testid="select-occupancy">
                                    <SelectValue placeholder="Select occupancy" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="primary">Primary</SelectItem>
                                  <SelectItem value="investment">Investment</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="loanPurpose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Loan Purpose</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm" data-testid="select-loan-purpose">
                                    <SelectValue placeholder="Select purpose" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="purchase">Purchase</SelectItem>
                                  <SelectItem value="refinance-cashout">Refinance - Cash Out</SelectItem>
                                  <SelectItem value="heloc">HELOC</SelectItem>
                                  <SelectItem value="refinance-rate-term">Refinance - Rate &amp; Term</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {form.watch("loanPurpose") === "purchase" && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name="purchasePrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Purchase Price</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. $450,000"
                                    className="h-8 text-sm"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                    data-testid="input-purchase-price"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      {form.watch("loanPurpose") === "refinance-cashout" && (
                        <div className="mt-2">
                          <FormField
                            control={form.control}
                            name="propertyValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Property Value</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. $550,000"
                                    className="h-8 text-sm"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                    data-testid="input-property-value"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name="ltvPayoffAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">LTV (Payoff Amount)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. $320,000"
                                  className="h-8 text-sm"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                  data-testid="input-ltv-payoff-amount"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fileClosing"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">File Closing</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm" data-testid="select-file-closing">
                                    <SelectValue placeholder="Select closing type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="personal-name">Personal Name</SelectItem>
                                  <SelectItem value="llc">LLC</SelectItem>
                                  <SelectItem value="trust">Trust</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="hidden">
                      <div>
                        <div className="grid grid-cols-3 gap-2">
                          <FormField control={form.control} name="termOffered" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Term Offered</FormLabel>
                              <FormControl><Input placeholder="e.g. 30 Year" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-term-offered" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="minCreditScore" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Min Credit Score</FormLabel>
                              <FormControl><Input placeholder="e.g. 620" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-min-credit-score" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="minLoanAmount" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Min Loan Amount</FormLabel>
                              <FormControl><Input placeholder="e.g. $100,000" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-min-loan-amount" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="highestLtv" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Highest LTV</FormLabel>
                              <FormControl><Input placeholder="e.g. 80%" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-highest-ltv" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="highestDti" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Highest DTI</FormLabel>
                              <FormControl><Input placeholder="e.g. 50%" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-highest-dti" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="maxCashout" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">MAX Cashout</FormLabel>
                              <FormControl><Input placeholder="e.g. $500,000" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-max-cashout" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="prepaymentPenalty" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Prepayment Penalty</FormLabel>
                              <FormControl><Input placeholder="e.g. 3 years" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-prepayment-penalty" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="compensationType" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Compensation</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm" data-testid="select-compensation-type-a">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="lender-paid">Lender Paid</SelectItem>
                                  <SelectItem value="borrower-paid">Borrower Paid</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                      <div>
                        <div className="grid grid-cols-3 gap-2">
                          <FormField control={form.control} name="lenderBTermOffered" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Term Offered</FormLabel>
                              <FormControl><Input placeholder="e.g. 30 Year" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-lenderb-term-offered" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lenderBMinCreditScore" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Min Credit Score</FormLabel>
                              <FormControl><Input placeholder="e.g. 620" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-lenderb-min-credit-score" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lenderBMinLoanAmount" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Min Loan Amount</FormLabel>
                              <FormControl><Input placeholder="e.g. $100,000" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-lenderb-min-loan-amount" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lenderBHighestLtv" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Highest LTV</FormLabel>
                              <FormControl><Input placeholder="e.g. 80%" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-lenderb-highest-ltv" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lenderBHighestDti" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Highest DTI</FormLabel>
                              <FormControl><Input placeholder="e.g. 50%" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-lenderb-highest-dti" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lenderBMaxCashout" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">MAX Cashout</FormLabel>
                              <FormControl><Input placeholder="e.g. $500,000" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-lenderb-max-cashout" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lenderBPrepaymentPenalty" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Prepayment Penalty</FormLabel>
                              <FormControl><Input placeholder="e.g. 3 years" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-lenderb-prepayment-penalty" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lenderBCompensationType" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Compensation</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm" data-testid="select-compensation-type-b">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="lender-paid">Lender Paid</SelectItem>
                                  <SelectItem value="borrower-paid">Borrower Paid</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lenderBFeesForLoan" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Fees for Loan</FormLabel>
                              <FormControl><Input placeholder="e.g. $3,500" className="h-8 text-sm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} data-testid="input-lenderb-fees-for-loan" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Card Display Info</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="loanType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Type of Loan</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., FHA, Conventional, VA"
                                  className="h-8 text-sm"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                  data-testid="input-loan-type"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="interestRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Interest Rate</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., 6.5%"
                                  className="h-8 text-sm"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                  data-testid="input-interest-rate"
                                />
                              </FormControl>
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
        
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        </DialogPrimitive.Content>
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
});
