import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/ui/tooltip";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { Sites } from "./components/pages/sites";
import { Agreements } from "./components/pages/agreements";
import { Schedule } from "./components/pages/schedule";
import { ViewAgreement } from "./components/pages/view-agreement";
import { EditAgreement } from "./components/pages/edit-agreement";

function AssetServiceAgreementsApp() {
  // Set page title
  useEffect(() => {
    document.title = "Labs | Asset Service Agreements";
  }, []);

  // Prevent body/html scrolling when this app is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Only show banner when VITE_SHOW_INTERNAL is "false" (production/customer-facing mode)
  const showBanner = import.meta.env.VITE_SHOW_INTERNAL === "false";

  return (
    <TooltipProvider>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <PrototypeBanner deviceType="desktop" />
        <div
          className={`flex-1 overflow-auto ${showBanner ? "pt-[61px]" : "pt-0"}`}
        >
          <Routes>
            <Route index element={<Navigate to="sites" replace />} />
            <Route path="sites" element={<Sites />} />
            <Route path="sites/:siteId" element={<Sites />} />
            <Route path="agreements" element={<Agreements />} />
            <Route path="agreements/view/:agreementId" element={<ViewAgreement />} />
            <Route path="agreements/edit/:agreementId" element={<EditAgreement />} />
            <Route path="schedule" element={<Schedule />} />
          </Routes>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default AssetServiceAgreementsApp;
