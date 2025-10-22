import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@shared/components/ui/tooltip";
import { PrototypeBanner } from "@shared/components/PrototypeBanner";
import { CategoryAttributes } from "./components/pages/category-attributes";
import { CategoryAttributesDetail } from "./components/pages/category-attributes-detail";
import { Manufacturers } from "./components/pages/manufacturers";
import { CoreAttributes } from "./components/pages/core-attributes";
import { Layout } from "./components/layout";

function AssetAttributesApp() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <PrototypeBanner deviceType="desktop" />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="categories" replace />} />
              <Route path="categories" element={<CategoryAttributes />} />
              <Route
                path="category/:categoryId"
                element={<CategoryAttributesDetail />}
              />
              <Route path="core-attributes" element={<CoreAttributes />} />
              <Route path="manufacturers" element={<Manufacturers />} />
            </Route>
          </Routes>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default AssetAttributesApp;
