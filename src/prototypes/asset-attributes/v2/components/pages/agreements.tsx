import { Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Card, CardContent } from "@/registry/ui/card";
import { WorkspaceHeader } from "../WorkspaceHeader";

export function Agreements() {
  const handleCreateAgreement = () => {
    // Placeholder - content will be inserted here
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <WorkspaceHeader workspaceTitle="Asset Management" />

      {/* Content */}
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Search placeholder */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-2xl">
              {/* Search placeholder - content will be inserted here */}
            </div>
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-sm">
                  No agreements yet.
                </p>
                <Button size="sm" onClick={handleCreateAgreement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create agreement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

