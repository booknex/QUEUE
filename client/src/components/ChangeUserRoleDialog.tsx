import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { UserWithRole } from "@shared/schema";

interface ChangeUserRoleDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserWithRole;
  companyId: number;
}

export function ChangeUserRoleDialog({ open, onClose, user, companyId }: ChangeUserRoleDialogProps) {
  const [role, setRole] = useState<"owner" | "admin" | "member">(user.role as "owner" | "admin" | "member");
  const { toast } = useToast();

  useEffect(() => {
    setRole(user.role as "owner" | "admin" | "member");
  }, [user]);

  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/company-users/${user.id}`, {
        companyId,
        role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users", companyId.toString()] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent data-testid="dialog-change-role">
        <DialogHeader>
          <DialogTitle data-testid="text-change-role-title">Change User Role</DialogTitle>
          <DialogDescription data-testid="text-change-role-description">
            Update the role for <strong>{user.username}</strong> in this company.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as "owner" | "admin" | "member")}>
              <SelectTrigger data-testid="select-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner" data-testid="option-role-owner">Owner</SelectItem>
                <SelectItem value="admin" data-testid="option-role-admin">Admin</SelectItem>
                <SelectItem value="member" data-testid="option-role-member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-change-role"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateRoleMutation.isPending || role === user.role}
              data-testid="button-save-change-role"
            >
              {updateRoleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
