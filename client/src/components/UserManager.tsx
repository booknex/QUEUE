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
import { Plus, Edit, Trash2, Search, User as UserIcon } from "lucide-react";
import { AddUserModal } from "./AddUserModal";
import { ManageUserModal } from "./ManageUserModal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { UserWithRole, User as UserType } from "@shared/schema";

type UserWithoutPassword = Omit<UserType, 'password'>;

interface UserManagerProps {
  open: boolean;
  onClose: () => void;
  companyId: number | null;
}

export function UserManager({ open, onClose, companyId }: UserManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [managingUser, setManagingUser] = useState<UserWithoutPassword | null>(null);
  const [removingUser, setRemovingUser] = useState<UserWithoutPassword | null>(null);
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch(`/api/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: open,
  });

  const { data: currentUser } = useQuery<{ id: string }>({
    queryKey: ["/api/user"],
  });

  const canManageUsers = true; // Unrestricted access - any user can manage all users

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setRemovingUser(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user: UserWithoutPassword) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower)
    );
  });

  const handleRemoveConfirm = () => {
    if (removingUser) {
      deleteUserMutation.mutate(removingUser.id);
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
              filteredUsers.map((user: UserWithoutPassword) => {
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
                            <UserIcon className="w-5 h-5 text-primary" />
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
            <AlertDialogTitle data-testid="text-remove-user-title">Delete User</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-remove-user-description">
              Are you sure you want to permanently delete <strong>{removingUser?.username}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              disabled={deleteUserMutation.isPending}
              data-testid="button-confirm-remove"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
