import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  companyId: number;
}

export function AddUserModal({ open, onClose, companyId }: AddUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "owner">("member");
  const { toast } = useToast();

  const addUserMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/company-users", {
        companyId,
        email: email.trim(),
        role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users", companyId.toString()] });
      toast({
        title: "Success",
        description: "User added to company successfully",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add user to company",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setEmail("");
    setRole("member");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    addUserMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent data-testid="dialog-add-user">
        <DialogHeader>
          <DialogTitle>Add User to Company</DialogTitle>
          <DialogDescription>
            Add an existing user to this company by their email address. They must have logged in to the application at least once.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={addUserMutation.isPending}
              data-testid="input-user-email"
            />
            <p className="text-xs text-muted-foreground">
              The user must have an account in the system (logged in at least once).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as "member" | "owner")}>
              <SelectTrigger data-testid="select-new-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Owners can manage users and have full access. Members have standard access.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addUserMutation.isPending}
              data-testid="button-cancel-add-user"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addUserMutation.isPending}
              data-testid="button-confirm-add-user"
            >
              {addUserMutation.isPending ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
