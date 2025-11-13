import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCircle } from "lucide-react";
import Contacts from "@/pages/Contacts";
import UsersView from "@/pages/UsersView";

interface PeopleViewProps {
  selectedCompanyId: number | null;
}

export default function PeopleView({ selectedCompanyId }: PeopleViewProps) {
  return (
    <Tabs defaultValue="contacts" className="w-full">
      <TabsList data-testid="people-tabs">
        <TabsTrigger value="contacts" data-testid="tab-contacts">
          <UserCircle className="w-4 h-4 mr-2" />
          Contacts
        </TabsTrigger>
        <TabsTrigger value="employees" data-testid="tab-employees">
          <Users className="w-4 h-4 mr-2" />
          Employees
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="contacts" data-testid="content-contacts">
        <Contacts selectedCompanyId={selectedCompanyId} />
      </TabsContent>
      
      <TabsContent value="employees" data-testid="content-employees">
        <UsersView selectedCompanyId={selectedCompanyId} />
      </TabsContent>
    </Tabs>
  );
}
