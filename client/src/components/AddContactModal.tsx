import { useMutation } from "@tanstack/react-query";
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
import { z } from "zod";

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  selectedCompanyId: number | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export function AddContactModal({ open, onClose, selectedCompanyId }: AddContactModalProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (selectedCompanyId === null) {
        throw new Error("Please select a company first");
      }

      const contactData: any = {
        name: data.name,
        companyId: selectedCompanyId,
      };

      if (data.phone && data.phone.trim()) {
        contactData.phone = data.phone;
      }
      if (data.email && data.email.trim()) {
        contactData.email = data.email;
      }

      const contactRes = await apiRequest("POST", "/api/contacts", contactData);
      if (!contactRes.ok) {
        const errorData = await contactRes.json();
        if (contactRes.status === 409) {
          throw new Error(errorData.error || "Contact already exists");
        }
        throw new Error(errorData.error || "Failed to create contact");
      }
      return await contactRes.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      form.reset();
      onClose();
      toast({
        title: "Contact created",
        description: "The contact has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contact.",
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
      <DialogContent className="sm:max-w-[550px]" data-testid="dialog-add-contact">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Create a new contact for this company.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter contact name..."
                      data-testid="input-contact-name"
                    />
                  </FormControl>
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
                      data-testid="input-contact-phone-direct"
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
                      data-testid="input-contact-email-direct"
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
                data-testid="button-cancel-contact"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-contact"
              >
                {createMutation.isPending ? "Creating..." : "Create Contact"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
