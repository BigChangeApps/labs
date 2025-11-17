import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/ui/tooltip";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { CategoryAttributes } from "./components/pages/category-attributes";
import { CategoryAttributesDetail } from "./components/pages/category-attributes-detail";
import { Manufacturers } from "./components/pages/manufacturers";
import { GlobalAttributes } from "./components/pages/global-attributes";
import { Layout } from "./components/layout";

function AssetAttributesVariationApp() {
  const location = useLocation();

  // Set page title
  useEffect(() => {
    document.title = "Labs | Asset Attributes Management (Variation)";
  }, []);

  // Prevent body/html scrolling when this app is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
  
  return (
    <TooltipProvider>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <PrototypeBanner deviceType="desktop" />
        <div className="flex-1 overflow-hidden pt-[61px]">
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="attributes" replace state={location.state} />} />
              <Route path="attributes" element={<CategoryAttributes />} />
              <Route
                path="category/:categoryId"
                element={<CategoryAttributesDetail />}
              />
              <Route path="global-attributes" element={<GlobalAttributes />} />
              <Route path="manufacturers" element={<Manufacturers />} />
            </Route>
          </Routes>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default AssetAttributesVariationApp;

