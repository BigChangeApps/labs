import { useNavigate, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { cn } from "@/registry/lib/utils";
import { useMemo } from "react";

type WorkspaceTab = "sites" | "agreements" | "schedule";

interface WorkspaceHeaderProps {
  workspaceTitle?: string;
}

const tabs: { id: WorkspaceTab; label: string; path: string }[] = [
  { id: "sites", label: "Sites", path: "sites" },
  { id: "agreements", label: "Agreements", path: "agreements" },
  { id: "schedule", label: "Schedule", path: "schedule" },
];

export function WorkspaceHeader({ workspaceTitle = "Assets" }: WorkspaceHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current pathname
  const activeTab = useMemo<WorkspaceTab>(() => {
    const pathname = location.pathname;
    // Check for specific tab routes first
    if (pathname.includes("/sites") && !pathname.includes("/settings")) return "sites";
    if (pathname.includes("/agreements") && !pathname.includes("/settings")) return "agreements";
    if (pathname.includes("/schedule") && !pathname.includes("/settings")) return "schedule";
    // Default to sites for asset routes (index, create-asset, edit-asset) or settings
    return "sites";
  }, [location.pathname]);

  const handleTabClick = (path: string) => {
    // Always navigate relative to the base /asset-attributes/v2 path
    const pathname = location.pathname;
    // Extract the base path (/asset-attributes/v2)
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    // Navigate to the tab path
    navigate(`${basePath}/${path}`);
  };

  const handleSettingsClick = () => {
    // Always navigate relative to the base /asset-attributes/v2 path
    const pathname = location.pathname;
    // Extract the base path (/asset-attributes/v2)
    const basePath = pathname.match(/^\/asset-attributes\/v2/)?.[0] || "/asset-attributes/v2";
    navigate(`${basePath}/settings/global-attributes`);
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-muted/50 border-b border-border">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-3">
          {/* Title and Settings */}
          <div className="flex items-center justify-between gap-4 w-full">
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              {workspaceTitle}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSettingsClick}
                className="shrink-0"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
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

