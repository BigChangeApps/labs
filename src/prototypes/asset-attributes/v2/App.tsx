/**
 * TODO-HANDOFF: Demo Feature Flags
 *
 * This prototype uses DevBar toggles (bottom toolbar) to control features during demos.
 * DevBar is only visible when VITE_SHOW_INTERNAL=true (dev mode).
 *
 * | Flag                   | DevBar Icon | Production: Flagsmith Flag       |
 * |------------------------|-------------|----------------------------------|
 * | showCategoryAddButton  | Eye/EyeOff  | canManageAssetCategories         |
 *
 * For production, replace localStorage checks with Flagsmith SDK:
 * - useCategoryAddButton() → flagsmith.hasFeature('canManageAssetCategories')
 */

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
import { Sites } from "./components/pages/sites";
import { Agreements } from "./components/pages/agreements";
import { Schedule } from "./components/pages/schedule";
import { SiteAssets } from "./components/pages/site-assets";
import { SiteAgreements } from "./components/pages/site-agreements";
import { SiteSchedule } from "./components/pages/site-schedule";
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

  // Only show banner when VITE_SHOW_INTERNAL is "false" (production/customer-facing mode)
  const showBanner = import.meta.env.VITE_SHOW_INTERNAL === "false";

  return (
    <TooltipProvider>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <PrototypeBanner deviceType="desktop" />
        <div className={`flex-1 overflow-hidden ${showBanner ? "pt-[61px]" : "pt-0"}`}>
          <Routes>
            {/* Default landing page - redirect to Sites */}
            <Route index element={<Navigate to="sites" replace />} />
            
            {/* Asset List - accessible but not default */}
            <Route path="assets" element={<AssetList />} />
            <Route path="create-asset" element={<CreateAsset />} />
            <Route path="create-asset/:categoryId" element={<CreateAsset />} />
            <Route path="edit-asset/:assetId" element={<EditAsset />} />

            {/* Workspace Tabs */}
            <Route path="sites" element={<Sites />} />
            <Route path="agreements" element={<Agreements />} />
            <Route path="schedule" element={<Schedule />} />

            {/* Site-specific workspace */}
            <Route path="site/:siteId" element={<Navigate to="assets" replace />} />
            <Route path="site/:siteId/assets" element={<SiteAssets />} />
            <Route path="site/:siteId/agreements" element={<SiteAgreements />} />
            <Route path="site/:siteId/schedule" element={<SiteSchedule />} />

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

