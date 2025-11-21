import { useParams } from "react-router-dom";
import { SiteWorkspaceHeader } from "../SiteWorkspaceHeader";
import { mockSites } from "../../lib/mock-asset-list-data";
import { useAttributeStore } from "../../lib/store";
import { Card, CardContent } from "@/registry/ui/card";
import { useMemo } from "react";

export function SiteOverview() {
  const { siteId } = useParams<{ siteId: string }>();
  const assets = useAttributeStore((state) => state.assets);
  
  const site = useMemo(() => {
    return siteId ? mockSites.find((s) => s.id === siteId) : undefined;
  }, [siteId]);

  const assetCount = useMemo(() => {
    if (!siteId) return 0;
    return assets.filter((asset) => asset.siteId === siteId).length;
  }, [assets, siteId]);

  if (!siteId) return null;

  return (
    <div className="w-full min-h-screen bg-background">
      <SiteWorkspaceHeader siteId={siteId} />

      {/* Content */}
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Site Details */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Site Information</h2>
                  <p className="text-sm text-muted-foreground">{site?.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Total Assets</h3>
                  <p className="text-2xl font-bold">{assetCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for additional overview content */}
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Overview content will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

