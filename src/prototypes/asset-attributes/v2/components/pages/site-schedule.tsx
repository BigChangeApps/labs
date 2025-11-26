import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Card, CardContent } from "@/registry/ui/card";
import { SiteWorkspaceHeader } from "../SiteWorkspaceHeader";

export function SiteSchedule() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();

  if (!siteId) return null;

  const handleCreateAgreement = () => {
    const pathname = window.location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2\/site\/[^/]+/)?.[0] || `/asset-attributes/v2/site/${siteId}`;
    navigate(`${basePath}/agreements`);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <SiteWorkspaceHeader siteId={siteId} />

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
                  Schedule tasks require an active service agreement. Create an agreement to start generating scheduled tasks.
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

