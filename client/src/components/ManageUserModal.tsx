import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<number>>(new Set());

  // Fetch all companies the current user has access to
  const { data: allCompanies = [], isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: open && !!user,
  });

  // Fetch companies the target user belongs to
  const { data: userCompanyIds = [], isLoading: loadingUserCompanies } = useQuery<number[]>({
    queryKey: ["/api/users", user?.id, "companies"],
    enabled: open && !!user,
  });

  // Initialize form when user or userCompanyIds change
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  useEffect(() => {
    if (userCompanyIds) {
      setSelectedCompanyIds(new Set(userCompanyIds));
    }
  }, [userCompanyIds]);

  // Add user to company mutation
  const addToCompanyMutation = useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: number; userId: string }) => {
      return apiRequest("POST", `/api/company-users`, {
        companyId,
        email: userId,
        role: "member",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add user to company",
      });
    },
  });

  // Remove user from company mutation
  const removeFromCompanyMutation = useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: number; userId: string }) => {
      return apiRequest("DELETE", `/api/company-users/${userId}`, { companyId });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove user from company",
      });
    },
  });

  const handleCompanyToggle = async (companyId: number, checked: boolean) => {
    if (!user) return;

    const newSelectedCompanyIds = new Set(selectedCompanyIds);
    
    if (checked) {
      newSelectedCompanyIds.add(companyId);
      setSelectedCompanyIds(newSelectedCompanyIds);
      
      try {
        await addToCompanyMutation.mutateAsync({ companyId, userId: user.id });
        await queryClient.invalidateQueries({ 
          predicate: (query) => {
            const key = query.queryKey[0];
            return key === "/api/company-users" || 
                   (Array.isArray(query.queryKey) && query.queryKey[0] === "/api/users" && query.queryKey[2] === "companies");
          }
        });
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
        await queryClient.invalidateQueries({ 
          predicate: (query) => {
            const key = query.queryKey[0];
            return key === "/api/company-users" || 
                   (Array.isArray(query.queryKey) && query.queryKey[0] === "/api/users" && query.queryKey[2] === "companies");
          }
        });
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

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* User Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">User Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    disabled
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    disabled
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    disabled
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                User profile editing is self-service only. Users must edit their own profile.
              </p>
            </div>

            <Separator />

            {/* Company Assignment Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Company Access</h3>
              <p className="text-xs text-muted-foreground">
                Select which companies this user can access. You can only assign users to companies where you are an owner or admin.
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : allCompanies.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No companies available</p>
              ) : (
                <div className="space-y-2">
                  {allCompanies.map((company) => (
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
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} data-testid="button-close-manage-user">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
