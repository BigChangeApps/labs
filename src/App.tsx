import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { CategoryManagement } from "@/components/category-management";
import { CategoryDetail } from "@/components/category-detail";
import { AttributeLibrary } from "@/components/attribute-library";
import { ManufacturersView } from "@/components/manufacturers-view";
import { FeatureSettingsButton } from "@/components/feature-settings-button";

function AppContent() {
  const location = useLocation();
  const isInCategoryDetail = location.pathname.includes("/category/");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Horizontal Tab Navigation - Hidden in category detail */}
      {!isInCategoryDetail && <SettingsSidebar />}

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<CategoryManagement />} />
          <Route path="/category/:categoryId" element={<CategoryDetail />} />
          <Route path="/library" element={<AttributeLibrary />} />
          <Route path="/manufacturers" element={<ManufacturersView />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppContent />
        <FeatureSettingsButton />
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
