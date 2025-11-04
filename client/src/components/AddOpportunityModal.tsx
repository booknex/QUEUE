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
import type { KanbanColumn } from "@shared/schema";
import { z } from "zod";

interface AddOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  selectedPipelineId: number | null;
}

const formSchema = z.object({
  title: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AddOpportunityModal({ open, onClose, selectedPipelineId }: AddOpportunityModalProps) {
  const { toast } = useToast();

  const { data: pipelineColumns = [] } = useQuery<KanbanColumn[]>({
    queryKey: ["/api/columns", selectedPipelineId],
    queryFn: async () => {
      const response = await fetch(`/api/columns?pipelineId=${selectedPipelineId}`);
      if (!response.ok) throw new Error("Failed to fetch columns");
      return response.json();
    },
    enabled: selectedPipelineId !== null,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      contactPhone: "",
      contactEmail: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Check if a pipeline is selected and has columns
      if (selectedPipelineId === null) {
        throw new Error("Please select a pipeline first");
      }
      
      if (pipelineColumns.length === 0) {
        throw new Error("Please add at least one column to this pipeline before creating opportunities");
      }
      
      // First create the contact using the title field as the contact name
      const contactData: any = {
        name: data.title,
      };
      
      // Only include phone and email if they have values
      if (data.contactPhone && data.contactPhone.trim()) {
        contactData.phone = data.contactPhone;
      }
      if (data.contactEmail && data.contactEmail.trim()) {
        contactData.email = data.contactEmail;
      }

      const contactRes = await apiRequest("POST", "/api/contacts", contactData);
      const contact = await contactRes.json();

      // Then create the opportunity with the contactId
      // Use the contact name as the opportunity title
      // Use the first column's ID (default column)
      const firstColumnId = pipelineColumns[0].id;

      const opportunityData: any = {
        title: data.title,
        columnId: firstColumnId,
        contactId: contact.id,
      };
      
      // Only include description if it has a value
      if (data.description && data.description.trim()) {
        opportunityData.description = data.description;
      }

      const opportunityRes = await apiRequest("POST", "/api/opportunities", opportunityData);
      return await opportunityRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      form.reset();
      onClose();
      toast({
        title: "Opportunity created",
        description: "The opportunity and contact have been added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create opportunity.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]" data-testid="dialog-add-opportunity">
        <DialogHeader>
          <DialogTitle>Add New Opportunity</DialogTitle>
          <DialogDescription>
            Create a new opportunity with contact information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter contact name..."
                      data-testid="input-opportunity-title"
                    />
                  </FormControl>
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
                data-testid="button-cancel-opportunity"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-opportunity"
              >
                {createMutation.isPending ? "Creating..." : "Create Opportunity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
