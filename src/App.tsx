import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CategoryManagement } from "@/components/category-management";
import { CategoryDetail } from "@/components/category-detail";
import { ManufacturersView } from "@/components/manufacturers-view";
import { CoreAttributesView } from "@/components/core-attributes-view";
import { FeatureSettingsButton } from "@/components/feature-settings-button";
import { AssetSettingsLayout } from "@/components/asset-settings-layout";
import { useAttributeStore } from "@/lib/store";

function ConditionalCoreAttributesRoute() {
  const { enableCategoriesListView } = useAttributeStore();
  
  if (enableCategoriesListView) {
    return <Navigate to="/categories" replace />;
  }
  
  return <CoreAttributesView />;
}

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route element={<AssetSettingsLayout />}>
                <Route index element={<Navigate to="/categories" replace />} />
                <Route path="/categories" element={<CategoryManagement />} />
                <Route
                  path="/category/:categoryId"
                  element={<CategoryDetail />}
                />
                <Route path="/manufacturers" element={<ManufacturersView />} />
                <Route
                  path="/core-attributes"
                  element={<ConditionalCoreAttributesRoute />}
                />
              </Route>
            </Routes>
          </main>
        </div>
        <FeatureSettingsButton />
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
