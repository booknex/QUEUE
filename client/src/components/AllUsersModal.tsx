import { useQuery } from "@tanstack/react-query";
import { User, Shield, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User as UserType } from "@shared/schema";

interface AllUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllUsersModal({ open, onOpenChange }: AllUsersModalProps) {
  const { data: users, isLoading, error } = useQuery<UserType[]>({
    queryKey: ["/api/all-users"],
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="dialog-all-users">
        <DialogHeader>
          <DialogTitle>All System Users</DialogTitle>
          <DialogDescription>
            View all users in the system (not company-specific)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading users...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Access Denied</h3>
              <p className="text-sm text-muted-foreground">
                Only super admins can view all system users.
              </p>
            </div>
          ) : users && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-sm text-muted-foreground">
                No users are registered in the system yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users?.map((user) => (
                <Card key={user.id} className="hover-elevate" data-testid={`user-card-${user.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate" data-testid={`user-username-${user.id}`}>
                            {user.username}
                          </h3>
                          {user.isSuperAdmin === 'true' && (
                            <Badge variant="default" className="flex-shrink-0">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {user.email && (
                            <p className="text-sm text-muted-foreground truncate" data-testid={`user-email-${user.id}`}>
                              {user.email}
                            </p>
                          )}
                          {(user.firstName || user.lastName) && (
                            <p className="text-sm text-muted-foreground">
                              {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            User ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
