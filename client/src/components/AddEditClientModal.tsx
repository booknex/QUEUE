import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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
import type { ClientFile } from "@shared/schema";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  description: z.string().optional(),
  status: z.enum(["waiting", "in_progress"]),
});

type FormData = z.infer<typeof formSchema>;

interface AddEditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  editingFile: ClientFile | null;
  isPending: boolean;
}

export function AddEditClientModal({
  open,
  onOpenChange,
  onSubmit,
  editingFile,
  isPending,
}: AddEditClientModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      description: "",
      status: "waiting",
    },
  });

  useEffect(() => {
    if (editingFile) {
      form.reset({
        clientName: editingFile.clientName,
        description: editingFile.description || "",
        status: editingFile.status as "waiting" | "in_progress",
      });
    } else {
      form.reset({
        clientName: "",
        description: "",
        status: "waiting",
      });
    }
  }, [editingFile, form]);

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
      <DialogContent className="max-w-md" data-testid="modal-add-edit-client">
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the work needed"
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
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
      </DialogContent>
    </Dialog>
  );
}
