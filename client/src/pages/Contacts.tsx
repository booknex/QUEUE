import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { User, Phone, Mail, Plus, Upload, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddContactModal } from "@/components/AddContactModal";
import { UploadContactsModal } from "@/components/UploadContactsModal";
import { EditContactModal } from "@/components/EditContactModal";
import MessageInboxModal from "@/components/MessageInboxModal";
import type { Contact } from "@shared/schema";

interface ContactsProps {
  selectedCompanyId: number | null;
}

export default function Contacts({ selectedCompanyId }: ContactsProps) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [showUploadContacts, setShowUploadContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [inboxContact, setInboxContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  const totalContacts = filteredContacts.length;
  const totalAllContacts = contacts?.length || 0;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        <div className="mb-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Contacts</h1>
              <p className="text-muted-foreground">
                View and manage all your contacts
                {searchQuery && totalContacts !== totalAllContacts && (
                  <span className="ml-1">
                    (found {totalContacts} of {totalAllContacts})
                  </span>
                )}
                {!searchQuery && totalContacts > 0 && (
                  <span className="ml-1">
                    ({totalContacts} {totalContacts === 1 ? 'contact' : 'contacts'})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowUploadContacts(true)}
                disabled={selectedCompanyId === null}
                variant="outline"
                data-testid="button-upload-contacts"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
              <Button
                onClick={() => setShowAddContact(true)}
                disabled={selectedCompanyId === null}
                data-testid="button-add-contact"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-contacts"
            />
          </div>
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
          <div className="overflow-y-auto max-h-[1200px] border rounded-md p-3" data-testid="contacts-scroll-container">
            <div className="space-y-3" data-testid="contacts-list">
              {filteredContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setSelectedContact(contact)}
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
                            className="font-medium text-base text-primary cursor-pointer hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInboxContact(contact);
                            }}
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
          </div>
        )}
      </div>

      <AddContactModal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        selectedCompanyId={selectedCompanyId}
      />
      
      <UploadContactsModal
        open={showUploadContacts}
        onClose={() => setShowUploadContacts(false)}
        selectedCompanyId={selectedCompanyId}
      />

      <EditContactModal
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        contact={selectedContact}
        selectedCompanyId={selectedCompanyId}
      />

      <MessageInboxModal
        contact={inboxContact}
        open={!!inboxContact}
        onOpenChange={(open: boolean) => {
          if (!open) setInboxContact(null);
        }}
      />
    </div>
  );
}
