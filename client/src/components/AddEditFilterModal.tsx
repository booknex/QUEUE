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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatusFilter } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Filter name is required"),
  status: z.enum(["APPROVED W/ CONDITIONS", "PRE-APPROVED", "APP-INTAKE", "NEEDS LENDER", "LOAN SETUP"]),
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
      status: "APP-INTAKE",
    },
  });

  useEffect(() => {
    if (editingFilter) {
      form.reset({
        name: editingFilter.name,
        status: editingFilter.status as "APPROVED W/ CONDITIONS" | "PRE-APPROVED" | "APP-INTAKE" | "NEEDS LENDER" | "LOAN SETUP",
      });
    } else {
      form.reset({
        name: "",
        status: "APP-INTAKE",
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
              ? "Update the filter details below."
              : "Create a new custom filter button."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter filter name (e.g., 'HIGH PRIORITY')"
                      {...field}
                      data-testid="input-filter-name"
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
                  <FormLabel>Status to Filter</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-filter-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="APPROVED W/ CONDITIONS">APPROVED W/ CONDITIONS</SelectItem>
                      <SelectItem value="PRE-APPROVED">PRE-APPROVED</SelectItem>
                      <SelectItem value="APP-INTAKE">APP-INTAKE</SelectItem>
                      <SelectItem value="NEEDS LENDER">NEEDS LENDER</SelectItem>
                      <SelectItem value="LOAN SETUP">LOAN SETUP</SelectItem>
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
                {isPending ? "Saving..." : editingFilter ? "Update" : "Add Filter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
