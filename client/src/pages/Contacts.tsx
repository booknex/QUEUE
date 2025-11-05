import { useQuery } from "@tanstack/react-query";
import { User, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Contact } from "@shared/schema";

interface ContactsProps {
  selectedCompanyId: number | null;
}

export default function Contacts({ selectedCompanyId }: ContactsProps) {
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", selectedCompanyId?.toString()],
    queryFn: async () => {
      if (selectedCompanyId === null) return [];
      const response = await fetch(`/api/contacts?companyId=${selectedCompanyId}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
    enabled: selectedCompanyId !== null,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Contacts</h1>
          <p className="text-muted-foreground">
            View all contacts from your opportunities
          </p>
        </div>

        {!contacts || contacts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No contacts yet. Create an opportunity to add contacts.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" data-testid="contacts-list">
            {contacts.map((contact) => (
              <Card
                key={contact.id}
                className="hover-elevate"
                data-testid={`contact-card-${contact.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3
                          className="font-medium text-base"
                          data-testid={`contact-name-${contact.id}`}
                        >
                          {contact.name}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          data-testid={`contact-id-${contact.id}`}
                        >
                          ID: {contact.id}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1.5">
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span data-testid={`contact-phone-${contact.id}`}>
                              {contact.phone}
                            </span>
                          </div>
                        )}
                        
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span data-testid={`contact-email-${contact.id}`}>
                              {contact.email}
                            </span>
                          </div>
                        )}

                        {!contact.phone && !contact.email && (
                          <p className="text-sm text-muted-foreground italic">
                            No contact information provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
