import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertContactSchema } from "@shared/schema";
import type { KanbanColumn, OpportunityWithContact, UserWithRole, Contact } from "@shared/schema";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  selectedPipelineId: number | null;
  selectedCompanyId: number | null;
  opportunity?: OpportunityWithContact | null;
}

const formSchema = z.object({
  title: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  description: z.string().optional(),
  assignedUserId: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AddOpportunityModal({ open, onClose, selectedPipelineId, selectedCompanyId, opportunity = null }: AddOpportunityModalProps) {
  const { toast } = useToast();
  const isEditMode = !!opportunity;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: pipelineColumns = [] } = useQuery<KanbanColumn[]>({
    queryKey: ["/api/columns", selectedPipelineId?.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/columns?pipelineId=${selectedPipelineId}`);
      if (!response.ok) throw new Error("Failed to fetch columns");
      return response.json();
    },
    enabled: selectedPipelineId !== null,
  });

  const { data: companyUsers = [], isLoading: isLoadingUsers } = useQuery<UserWithRole[]>({
    queryKey: ["/api/company-users", selectedCompanyId?.toString()],
    queryFn: async () => {
      if (selectedCompanyId === null) return [];
      const response = await fetch(`/api/company-users?companyId=${selectedCompanyId}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: selectedCompanyId !== null && open,
  });

  const { data: companyContacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", selectedCompanyId?.toString()],
    queryFn: async () => {
      if (selectedCompanyId === null) return [];
      const response = await fetch(`/api/contacts?companyId=${selectedCompanyId}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
    enabled: selectedCompanyId !== null && open,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      contactPhone: "",
      contactEmail: "",
      description: "",
      assignedUserId: null,
    },
  });

  // Reset form when opportunity changes (for edit mode)
  useEffect(() => {
    if (opportunity) {
      form.reset({
        title: opportunity.contactName || "",
        contactPhone: opportunity.contactPhone || "",
        contactEmail: opportunity.contactEmail || "",
        description: opportunity.description || "",
        assignedUserId: opportunity.assignedUserId || null,
      });
    } else {
      form.reset({
        title: "",
        contactPhone: "",
        contactEmail: "",
        description: "",
        assignedUserId: null,
      });
    }
  }, [opportunity]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditMode && opportunity) {
        // Update existing opportunity and contact
        // Always include all fields so users can clear values
        const contactData: any = {
          name: data.title,
          phone: data.contactPhone && data.contactPhone.trim() ? data.contactPhone : "",
          email: data.contactEmail && data.contactEmail.trim() ? data.contactEmail : "",
        };

        // Update contact
        await apiRequest("PATCH", `/api/contacts/${opportunity.contactId}`, contactData);

        // Update opportunity
        const opportunityData: any = {
          title: data.title,
          description: data.description && data.description.trim() ? data.description : "",
          assignedUserId: data.assignedUserId || null,
        };

        const opportunityRes = await apiRequest("PATCH", `/api/opportunities/${opportunity.id}`, opportunityData);
        return await opportunityRes.json();
      } else {
        // Create new opportunity and contact
        // Check if a pipeline is selected and has columns
        if (selectedPipelineId === null) {
          throw new Error("Please select a pipeline first");
        }
        
        if (pipelineColumns.length === 0) {
          throw new Error("Please add at least one column to this pipeline before creating opportunities");
        }
        
        let contactId: number;
        
        // If a contact was selected from the autocomplete, use that existing contact
        if (selectedContactId !== null) {
          contactId = selectedContactId;
        } else {
          // Create a new contact using the title field as the contact name
          const contactData: any = {
            name: data.title,
            companyId: selectedCompanyId,
          };
          
          // Only include phone and email if they have values
          if (data.contactPhone && data.contactPhone.trim()) {
            contactData.phone = data.contactPhone;
          }
          if (data.contactEmail && data.contactEmail.trim()) {
            contactData.email = data.contactEmail;
          }

          const contactRes = await apiRequest("POST", "/api/contacts", contactData);
          if (!contactRes.ok) {
            const errorData = await contactRes.json();
            if (contactRes.status === 409) {
              throw new Error(`Contact "${data.title}" already exists. Please use a different name or update the existing contact.`);
            }
            throw new Error(errorData.error || "Failed to create contact");
          }
          const contact = await contactRes.json();
          contactId = contact.id;
        }

        // Then create the opportunity with the contactId
        // Use the contact name as the opportunity title
        // Use the first column's ID (default column)
        const firstColumnId = pipelineColumns[0].id;

        const opportunityData: any = {
          title: data.title,
          columnId: firstColumnId,
          contactId: contactId,
          assignedUserId: data.assignedUserId || null,
        };
        
        // Only include description if it has a value
        if (data.description && data.description.trim()) {
          opportunityData.description = data.description;
        }

        const opportunityRes = await apiRequest("POST", "/api/opportunities", opportunityData);
        return await opportunityRes.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      form.reset();
      onClose();
      toast({
        title: isEditMode ? "Opportunity updated" : "Opportunity created",
        description: isEditMode 
          ? "The opportunity and contact have been updated."
          : "The opportunity and contact have been added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || (isEditMode ? "Failed to update opportunity." : "Failed to create opportunity."),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!opportunity) return;
      await apiRequest("DELETE", `/api/opportunities/${opportunity.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      form.reset();
      onClose();
      setShowDeleteConfirm(false);
      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete opportunity.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  const handleClose = () => {
    if (!saveMutation.isPending) {
      form.reset();
      setContactSearchOpen(false);
      setSelectedContactId(null);
      onClose();
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContactId(contact.id);
    form.setValue("title", contact.name);
    form.setValue("contactPhone", contact.phone || "");
    form.setValue("contactEmail", contact.email || "");
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]" data-testid="dialog-add-opportunity">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Opportunity" : "Add New Opportunity"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the opportunity and contact information."
              : "Create a new opportunity with contact information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col relative" ref={dropdownRef}>
                  <FormLabel>Contact Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Start typing contact name..."
                      data-testid="input-opportunity-title"
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
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter phone number..."
                      data-testid="input-contact-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      type="email"
                      placeholder="Enter email address..."
                      data-testid="input-contact-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedUserId"
              render={({ field }) => {
                // Use special sentinel value for unassigned instead of empty string
                const UNASSIGNED = "__unassigned__";
                const currentValue = field.value || UNASSIGNED;
                const isValueValid = currentValue !== UNASSIGNED && companyUsers.some(u => u.id === currentValue);
                const selectValue = isValueValid ? currentValue : UNASSIGNED;
                
                return (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select
                      value={selectValue}
                      onValueChange={(value) => field.onChange(value === UNASSIGNED ? null : value)}
                      disabled={isLoadingUsers}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-assigned-user">
                          <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select a user (optional)"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                        {companyUsers.map((user) => {
                          const displayName = user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.firstName || user.username;
                          return (
                            <SelectItem key={user.id} value={user.id}>
                              {displayName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter opportunity description..."
                      data-testid="input-opportunity-description"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between gap-2">
              <div>
                {isEditMode && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={saveMutation.isPending || deleteMutation.isPending}
                    data-testid="button-delete-opportunity"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={saveMutation.isPending || deleteMutation.isPending}
                  data-testid="button-cancel-opportunity"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending || deleteMutation.isPending}
                  data-testid="button-submit-opportunity"
                >
                  {saveMutation.isPending 
                    ? (isEditMode ? "Updating..." : "Creating...") 
                    : (isEditMode ? "Update Opportunity" : "Create Opportunity")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent data-testid="dialog-delete-opportunity-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this opportunity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteMutation.isPending}
              data-testid="button-cancel-delete-opportunity"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover-elevate"
              data-testid="button-confirm-delete-opportunity"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
