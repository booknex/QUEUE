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
import { Button } from "@/components/ui/button";
import type { StatusFilter } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Filter name is required").transform(val => val.toUpperCase()),
});

type FormData = z.infer<typeof formSchema>;

interface AddEditFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  editingFilter: StatusFilter | null;
  isPending: boolean;
}

export function AddEditFilterModal({
  open,
  onOpenChange,
  onSubmit,
  editingFilter,
  isPending,
}: AddEditFilterModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (editingFilter) {
      form.reset({
        name: editingFilter.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [editingFilter, form]);

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
      <DialogContent className="max-w-md" data-testid="modal-add-edit-filter">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {editingFilter ? "Edit Filter" : "Add New Filter"}
          </DialogTitle>
          <DialogDescription data-testid="text-modal-description">
            {editingFilter
              ? "Update the filter name. This will also update the status name for all clients using this status."
              : "Create a new custom filter. The filter name will become a new status option for client cards."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter/Status Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name (e.g., 'HIGH PRIORITY', 'FOLLOW UP')"
                      {...field}
                      data-testid="input-filter-name"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    This name will be used as a status option in client cards
                  </p>
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
                {isPending ? "Saving..." : editingFilter ? "Update" : "Add Filter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
