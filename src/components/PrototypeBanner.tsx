import { useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";
import type { DeviceType } from "@/data/prototypes";

interface PrototypeBannerProps {
  deviceType?: DeviceType;
}

export function PrototypeBanner({
  deviceType = "desktop",
}: PrototypeBannerProps) {
  const [searchParams] = useSearchParams();
  
  // Only show banner when VITE_SHOW_INTERNAL is "false" (production/customer-facing mode)
  const showInternal = import.meta.env.VITE_SHOW_INTERNAL !== "false";
  
  // Hide banner during thumbnail generation
  const isThumbnailMode = searchParams.get("thumbnail") === "true";

  if (isThumbnailMode) {
    return null;
  }

  // Only show banner for desktop prototypes
  if (deviceType !== "desktop") {
    return null;
  }

  // Only show banner in production/customer-facing mode (when VITE_SHOW_INTERNAL is false)
  if (showInternal) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-900/50"
      data-thumbnail-hide="true"
    >
      <div className="w-full px-6 py-3">
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <span className="font-medium">Prototype mode:</span> You're viewing an interactive prototype for BigChange. No data will be saved.
          </p>
        </div>
      </div>
    </div>
  );
}
