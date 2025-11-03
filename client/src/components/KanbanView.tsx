import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function KanbanView() {
  const [activeTab, setActiveTab] = useState("opportunities");

  return (
    <div className="space-y-4" data-testid="kanban-view">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kanban Board</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" data-testid="button-kanban-add">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="kanban-tabs">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="opportunities" data-testid="tab-opportunities">
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="pipelines" data-testid="tab-pipelines">
            Pipelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-4" data-testid="content-opportunities">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No opportunities yet
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">In Progress</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No opportunities yet
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Closed</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No opportunities yet
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipelines" className="mt-4" data-testid="content-pipelines">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Lead</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pipelines yet
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Qualified</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pipelines yet
              </div>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Converted</CardTitle>
                </CardHeader>
              </Card>
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pipelines yet
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
