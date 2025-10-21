import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CategoryManagement } from "@/components/category-management";
import { CategoryDetail } from "@/components/category-detail";
import { ManufacturersView } from "@/components/manufacturers-view";
import { CoreAttributesView } from "@/components/core-attributes-view";
import { AssetSettingsLayout } from "@/components/asset-settings-layout";

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
                <Route
                  path="/core-attributes"
                  element={<CoreAttributesView />}
                />
                <Route path="/manufacturers" element={<ManufacturersView />} />
              </Route>
            </Routes>
          </main>
        </div>
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
