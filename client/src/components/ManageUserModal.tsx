import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface ManageUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export function ManageUserModal({ open, onClose, user }: ManageUserModalProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<number>>(new Set());
  const prevUserCompanyIdsRef = useRef<string>("");

  // Fetch all companies the current user has access to
  const { data: allCompanies = [], isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: open && !!user,
  });

  // Fetch companies the target user belongs to
  const { data: userCompanyIds, isLoading: loadingUserCompanies } = useQuery<number[]>({
    queryKey: ["/api/users", user?.id, "companies"],
    enabled: open && !!user,
  });

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  // Initialize selected companies when userCompanyIds is loaded
  useEffect(() => {
    const currentUserCompanyIds = JSON.stringify(userCompanyIds || []);
    if (currentUserCompanyIds !== prevUserCompanyIdsRef.current) {
      prevUserCompanyIdsRef.current = currentUserCompanyIds;
      if (userCompanyIds && Array.isArray(userCompanyIds)) {
        setSelectedCompanyIds(new Set(userCompanyIds));
      } else {
        setSelectedCompanyIds(new Set());
      }
    }
  }, [userCompanyIds]);

  // Add user to company mutation
  const addToCompanyMutation = useMutation({
    mutationFn: async ({ companyId, userEmail }: { companyId: number; userEmail: string }) => {
      return apiRequest("POST", `/api/company-users`, {
        companyId,
        email: userEmail,
        role: "member",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === "/api/company-users" || 
                 key === "/api/companies" ||
                 (Array.isArray(query.queryKey) && query.queryKey[0] === "/api/users" && query.queryKey[2] === "companies");
        }
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to add user to company";
      if (typeof error?.error === 'string') {
        errorMessage = error.error;
      } else if (typeof error?.message === 'string') {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });

  // Remove user from company mutation
  const removeFromCompanyMutation = useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: number; userId: string }) => {
      return apiRequest("DELETE", `/api/company-users/${userId}`, { companyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === "/api/company-users" || 
                 key === "/api/companies" ||
                 (Array.isArray(query.queryKey) && query.queryKey[0] === "/api/users" && query.queryKey[2] === "companies");
        }
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to remove user from company";
      if (typeof error?.error === 'string') {
        errorMessage = error.error;
      } else if (typeof error?.message === 'string') {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; firstName: string; lastName: string }) => {
      return apiRequest("PATCH", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-users"] });
      toast({
        title: "Success",
        description: "User profile updated successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update user profile";
      if (typeof error?.error === 'string') {
        errorMessage = error.error;
      } else if (typeof error?.message === 'string') {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      return apiRequest("POST", `/api/users/${user?.id}/password`, { newPassword });
    },
    onSuccess: () => {
      setNewPassword("");
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update password";
      if (typeof error?.error === 'string') {
        errorMessage = error.error;
      } else if (typeof error?.message === 'string') {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateProfileMutation.mutateAsync({
      username,
      email,
      firstName,
      lastName,
    });
  };

  const handleSavePassword = async () => {
    if (!user || !newPassword) return;
    await updatePasswordMutation.mutateAsync(newPassword);
  };

  const handleCompanyToggle = async (companyId: number, checked: boolean) => {
    if (!user) return;

    const newSelectedCompanyIds = new Set(selectedCompanyIds);
    
    if (checked) {
      newSelectedCompanyIds.add(companyId);
      setSelectedCompanyIds(newSelectedCompanyIds);
      
      try {
        // Use email or username as the identifier
        const userIdentifier = user.email || user.username;
        await addToCompanyMutation.mutateAsync({ companyId, userEmail: userIdentifier });
        toast({
          title: "Success",
          description: `${user.username} added to company`,
        });
      } catch (error) {
        // Revert on error
        newSelectedCompanyIds.delete(companyId);
        setSelectedCompanyIds(new Set(newSelectedCompanyIds));
      }
    } else {
      newSelectedCompanyIds.delete(companyId);
      setSelectedCompanyIds(newSelectedCompanyIds);
      
      try {
        await removeFromCompanyMutation.mutateAsync({ companyId, userId: user.id });
        toast({
          title: "Success",
          description: `${user.username} removed from company`,
        });
      } catch (error) {
        // Revert on error
        newSelectedCompanyIds.add(companyId);
        setSelectedCompanyIds(new Set(newSelectedCompanyIds));
      }
    }
  };

  if (!user) return null;

  const isLoading = loadingCompanies || loadingUserCompanies;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]" data-testid="dialog-manage-user">
        <DialogHeader>
          <DialogTitle data-testid="text-manage-user-title">Manage User: {user.username}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            <TabsTrigger value="password" data-testid="tab-password">Password</TabsTrigger>
            <TabsTrigger value="companies" data-testid="tab-companies">Companies</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[calc(90vh-12rem)] mt-4 pr-4">
            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="password" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    data-testid="input-new-password"
                  />
                </div>
                <Button 
                  onClick={handleSavePassword}
                  disabled={updatePasswordMutation.isPending || !newPassword}
                  data-testid="button-save-password"
                >
                  {updatePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="companies" className="space-y-4">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Select which companies this user can access.
                </p>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (allCompanies || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No companies available</p>
                ) : (
                  <div className="space-y-2">
                    {(allCompanies || []).map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center space-x-2 p-2 rounded hover-elevate"
                        data-testid={`company-checkbox-${company.id}`}
                      >
                        <Checkbox
                          id={`company-${company.id}`}
                          checked={selectedCompanyIds.has(company.id)}
                          onCheckedChange={(checked) => handleCompanyToggle(company.id, checked as boolean)}
                          disabled={addToCompanyMutation.isPending || removeFromCompanyMutation.isPending}
                          data-testid={`checkbox-company-${company.id}`}
                        />
                        <Label
                          htmlFor={`company-${company.id}`}
                          className="flex-1 cursor-pointer"
                          data-testid={`label-company-${company.id}`}
                        >
                          {company.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline" data-testid="button-close-manage-user">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
