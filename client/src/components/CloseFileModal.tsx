import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { ClientFile } from "@shared/schema";

const closeFormSchema = z.object({
  closedAt: z.string().min(1, "Closed date is required"),
});

type CloseFormValues = z.infer<typeof closeFormSchema>;

interface CloseFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CloseFormValues) => void;
  file: ClientFile | null;
  isPending?: boolean;
}

export function CloseFileModal({
  open,
  onOpenChange,
  onSubmit,
  file,
  isPending = false,
}: CloseFileModalProps) {
  const form = useForm<CloseFormValues>({
    resolver: zodResolver(closeFormSchema),
    defaultValues: {
      closedAt: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (data: CloseFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-close-file">
        <DialogHeader>
          <DialogTitle>Close Client File</DialogTitle>
          <DialogDescription>
            {file ? `Set the closed date for "${file.clientName}"` : "Set the closed date for this client"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="closedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closed Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      data-testid="input-closed-date"
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
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit">
                {isPending ? "Closing..." : "Close File"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
