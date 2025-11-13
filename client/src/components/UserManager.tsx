import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, User } from "lucide-react";
import { AddUserModal } from "./AddUserModal";
import { ManageUserModal } from "./ManageUserModal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { UserWithRole } from "@shared/schema";

interface UserManagerProps {
  open: boolean;
  onClose: () => void;
  companyId: number | null;
}

export function UserManager({ open, onClose, companyId }: UserManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [managingUser, setManagingUser] = useState<UserWithRole | null>(null);
  const [removingUser, setRemovingUser] = useState<UserWithRole | null>(null);
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<UserWithRole[]>({
    queryKey: ["/api/company-users", companyId?.toString()],
    queryFn: async () => {
      if (!companyId) return [];
      const response = await fetch(`/api/company-users?companyId=${companyId}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: open && companyId !== null,
  });

  const { data: currentUser } = useQuery<{ id: string }>({
    queryKey: ["/api/user"],
  });

  const currentUserRole = users.find(u => u.id === currentUser?.id)?.role;
  const canManageUsers = true; // Unrestricted access - any user can manage all users

  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!companyId) throw new Error("Company ID is required");
      return apiRequest("DELETE", `/api/company-users/${userId}?companyId=${companyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users", companyId?.toString()] });
      setRemovingUser(null);
      toast({
        title: "Success",
        description: "User removed from company successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from company",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user: UserWithRole) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleRemoveConfirm = () => {
    if (removingUser) {
      removeUserMutation.mutate(removingUser.id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col" data-testid="dialog-user-manager">
          <DialogHeader>
            <DialogTitle data-testid="text-user-manager-title">User Management</DialogTitle>
            <DialogDescription data-testid="text-user-manager-description">
              Manage users for this company. Add, edit, or remove user access and roles.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            {canManageUsers && (
              <Button
                onClick={() => setAddUserModalOpen(true)}
                data-testid="button-add-user"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No users found matching your search." : "No users in this company yet."}
              </div>
            ) : (
              filteredUsers.map((user: UserWithRole) => {
                const isCurrentUser = currentUser?.id === user.id;
                return (
                  <Card 
                    key={user.id} 
                    className="hover-elevate cursor-pointer" 
                    data-testid={`card-user-${user.id}`}
                    onClick={() => canManageUsers && setManagingUser(user)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium" data-testid={`text-username-${user.id}`}>
                              {user.username}
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground ml-2">(You)</span>
                              )}
                            </p>
                            <Badge variant={getRoleBadgeVariant(user.role)} data-testid={`badge-role-${user.id}`}>
                              {user.role}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email && <span data-testid={`text-email-${user.id}`}>{user.email}</span>}
                            {user.firstName && user.lastName && (
                              <span className="ml-2" data-testid={`text-name-${user.id}`}>
                                • {user.firstName} {user.lastName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {canManageUsers && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRemovingUser(user)}
                            disabled={isCurrentUser}
                            data-testid={`button-remove-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {companyId && (
        <AddUserModal
          open={addUserModalOpen}
          onClose={() => setAddUserModalOpen(false)}
          companyId={companyId}
        />
      )}

      <ManageUserModal
        open={!!managingUser}
        onClose={() => setManagingUser(null)}
        user={managingUser}
      />

      <AlertDialog open={!!removingUser} onOpenChange={(open) => !open && setRemovingUser(null)}>
        <AlertDialogContent data-testid="dialog-remove-user">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-remove-user-title">Remove User</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-remove-user-description">
              Are you sure you want to remove <strong>{removingUser?.username}</strong> from this company?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              disabled={removeUserMutation.isPending}
              data-testid="button-confirm-remove"
            >
              {removeUserMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
