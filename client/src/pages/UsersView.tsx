import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { User, Shield, ShieldCheck, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AddUserModal } from "@/components/AddUserModal";
import type { UserWithRole } from "@shared/schema";

interface UsersViewProps {
  selectedCompanyId: number | null;
}

export default function UsersView({ selectedCompanyId }: UsersViewProps) {
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithRole | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"owner" | "member">("member");
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<UserWithRole[]>({
    queryKey: ["/api/company-users", selectedCompanyId?.toString()],
    queryFn: async () => {
      if (selectedCompanyId === null) return [];
      const response = await fetch(`/api/company-users?companyId=${selectedCompanyId}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: selectedCompanyId !== null,
  });

  const { data: currentUser } = useQuery<{ id: string }>({
    queryKey: ["/api/auth/user"],
  });

  const currentUserRole = users?.find(u => u.id === currentUser?.id)?.role;
  const isOwner = currentUserRole === "owner";

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest("PATCH", `/api/company-users/${userId}`, {
        companyId: selectedCompanyId,
        role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users", selectedCompanyId?.toString()] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/company-users/${userId}?companyId=${selectedCompanyId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users", selectedCompanyId?.toString()] });
      toast({
        title: "Success",
        description: "User removed from company successfully",
      });
      setDeletingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from company",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: UserWithRole) => {
    if (!isOwner) {
      toast({
        title: "Access Denied",
        description: "Only owners can change user roles",
        variant: "destructive",
      });
      return;
    }
    setSelectedRole(user.role as "owner" | "member");
    setEditingUser(user);
  };

  const handleDeleteUser = (user: UserWithRole) => {
    if (!isOwner) {
      toast({
        title: "Access Denied",
        description: "Only owners can remove users",
        variant: "destructive",
      });
      return;
    }
    setDeletingUser(user);
  };

  const handleSaveRole = () => {
    if (!editingUser) return;
    updateUserRoleMutation.mutate({
      userId: editingUser.id,
      role: selectedRole,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    deleteUserMutation.mutate(deletingUser.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  const totalUsers = users?.length || 0;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Users</h1>
              <p className="text-muted-foreground">
                Manage company users and their roles
                {totalUsers > 0 && (
                  <span className="ml-1">
                    ({totalUsers} {totalUsers === 1 ? 'user' : 'users'})
                  </span>
                )}
              </p>
              {!isOwner && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Only owners can edit user roles or remove users
                </p>
              )}
            </div>
            {isOwner && (
              <Button
                onClick={() => setShowAddUser(true)}
                disabled={selectedCompanyId === null}
                data-testid="button-add-user"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>

        {!users || users.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No users found in this company.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-y-auto max-h-[1200px] border rounded-md p-3" data-testid="users-scroll-container">
            <div className="space-y-3" data-testid="users-list">
              {users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <Card
                    key={user.id}
                    className="hover-elevate"
                    data-testid={`user-card-${user.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          {user.role === "owner" ? (
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3
                              className="font-medium text-base"
                              data-testid={`user-name-${user.id}`}
                            >
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </h3>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                            <Badge 
                              variant={user.role === "owner" ? "default" : "outline"}
                              className="text-xs"
                              data-testid={`user-role-${user.id}`}
                            >
                              {user.role}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="text-sm text-muted-foreground" data-testid={`user-email-${user.id}`}>
                              {user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Member since {new Date(user.memberSince).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {isOwner && !isCurrentUser && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              Edit Role
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user)}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit User Role Dialog */}
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent data-testid="dialog-edit-user-role">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.firstName && editingUser?.lastName
                ? `${editingUser.firstName} ${editingUser.lastName}`
                : editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as "owner" | "member")}>
                <SelectTrigger data-testid="select-user-role">
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
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              data-testid="button-cancel-edit-role"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={updateUserRoleMutation.isPending}
              data-testid="button-save-role"
            >
              {updateUserRoleMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deletingUser !== null} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent data-testid="dialog-delete-user">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User from Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deletingUser?.firstName && deletingUser?.lastName
                ? `${deletingUser.firstName} ${deletingUser.lastName}`
                : deletingUser?.email} from this company? They will lose access to all company data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingUser(null)} data-testid="button-cancel-delete-user">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-user"
            >
              {deleteUserMutation.isPending ? "Removing..." : "Remove User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Modal */}
      {selectedCompanyId !== null && (
        <AddUserModal
          open={showAddUser}
          onClose={() => setShowAddUser(false)}
          companyId={selectedCompanyId}
        />
      )}
    </div>
  );
}
