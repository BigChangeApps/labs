import { Card, CardContent } from "@/registry/ui/card";
import { WorkspaceHeader } from "../WorkspaceHeader";

export function Schedule() {
  return (
    <div className="w-full min-h-screen bg-background">
      <WorkspaceHeader />

      {/* Content */}
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Placeholder */}
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-sm">
                  Schedule view coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
