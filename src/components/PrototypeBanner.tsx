import { useNavigate, useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";
import { Button } from "@/registry/ui/button";
import type { DeviceType } from "@/data/prototypes";

interface PrototypeBannerProps {
  deviceType?: DeviceType;
}

export function PrototypeBanner({
  deviceType = "desktop",
}: PrototypeBannerProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Hide banner during thumbnail generation
  const isThumbnailMode = searchParams.get("thumbnail") === "true";

  if (isThumbnailMode) {
    return null;
  }

  // Only show banner for desktop prototypes
  if (deviceType !== "desktop") {
    return null;
  }

  return (
    <div
      className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-900/50"
      data-thumbnail-hide="true"
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-medium">Prototype Mode:</span> You're
              viewing an interactive prototype.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 shrink-0"
          >
            Back to Labs
          </Button>
        </div>
      </div>
    </div>
  );
}
