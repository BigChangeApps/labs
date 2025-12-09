import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { cn } from "@/registry/lib/utils";
import { useMemo } from "react";
// TODO-HANDOFF: getSiteName should use sites data from store/API, not mock helper
import { getSiteName } from "../lib/mock-asset-list-data";
import { useAttributeStore } from "../lib/store";

type SiteWorkspaceTab = "assets" | "agreements" | "schedule";

interface SiteWorkspaceHeaderProps {
  siteId: string;
}

export function SiteWorkspaceHeader({ siteId }: SiteWorkspaceHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const siteName = getSiteName(siteId);
  const assets = useAttributeStore((state) => state.assets);

  // Get asset count for this site
  const assetCount = useMemo(() => {
    return assets.filter((asset) => asset.siteId === siteId).length;
  }, [assets, siteId]);

  // Build tabs with dynamic asset count
  const tabs: { id: SiteWorkspaceTab; label: string; path: string }[] = useMemo(() => [
    { id: "assets", label: `Assets (${assetCount})`, path: "" },
    { id: "agreements", label: "Agreements", path: "agreements" },
    { id: "schedule", label: "Schedule", path: "schedule" },
  ], [assetCount]);

  // Determine active tab based on current pathname
  const activeTab = useMemo<SiteWorkspaceTab>(() => {
    const pathname = location.pathname;
    if (pathname.includes("/agreements") && !pathname.includes("/settings")) return "agreements";
    if (pathname.includes("/schedule") && !pathname.includes("/settings")) return "schedule";
    // Default to assets for the base site route
    return "assets";
  }, [location.pathname]);

  const handleTabClick = (path: string) => {
    const pathname = location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2\/site\/[^/]+/)?.[0] || `/asset-attributes/v2/site/${siteId}`;
    
    if (path === "") {
      // Navigate to assets (default view)
      navigate(`${basePath}/assets`);
    } else {
      navigate(`${basePath}/${path}`);
    }
  };

  const handleBackClick = () => {
    const pathname = location.pathname;
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    const returnTo = location.state?.returnTo as string | undefined;
    
    if (returnTo === 'asset-list') {
      // Return to asset list page
      navigate(`${basePath}/assets`);
    } else {
      // Default: go to sites tab
      navigate(`${basePath}/sites`);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-muted/50 border-b border-border">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-3">
          {/* Title and Actions */}
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="shrink-0 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                {siteName}
              </h1>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex items-end gap-3 -mb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  "pb-3 pt-0 text-sm transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  activeTab === tab.id
                    ? "px-px text-hw-text font-bold border-b-2 border-hw-interactive"
                    : "px-0 text-hw-text-secondary font-medium border-b-2 border-transparent"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

