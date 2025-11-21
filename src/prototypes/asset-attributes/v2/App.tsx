import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/ui/tooltip";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { Categories } from "./components/pages/categories";
import { CategoryDetail } from "./components/pages/category-detail";
import { Manufacturers } from "./components/pages/manufacturers";
import { GlobalAttributes } from "./components/pages/global-attributes";
import { CreateAsset } from "./components/pages/create-asset";
import { EditAsset } from "./components/pages/edit-asset";
import { AssetList } from "./components/pages/asset-list";
import { SettingsLayout } from "./components/settings-layout";

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
            {/* Asset List - Landing page */}
            <Route index element={<AssetList />} />
            <Route path="create-asset" element={<CreateAsset />} />
            <Route path="create-asset/:categoryId" element={<CreateAsset />} />
            <Route path="edit-asset/:assetId" element={<EditAsset />} />

            {/* Settings - Full screen experience with sidebar */}
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="global-attributes" replace state={location.state} />} />
              <Route path="global-attributes" element={<GlobalAttributes />} />
              <Route path="categories" element={<Categories />} />
              <Route path="category/:categoryId" element={<CategoryDetail />} />
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

