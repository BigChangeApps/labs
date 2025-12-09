import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/ui/tooltip";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { Index } from "./components/pages/index";

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
          className={`flex-1 overflow-hidden ${showBanner ? "pt-[61px]" : "pt-0"}`}
        >
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Index />} />
          </Routes>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default AssetServiceAgreementsApp;
