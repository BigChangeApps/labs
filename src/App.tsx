import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { CategoryManagement } from "@/components/category-management";
import { CategoryDetail } from "@/components/category-detail";
import { AttributeLibrary } from "@/components/attribute-library";
import { ManufacturersView } from "@/components/manufacturers-view";

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Main Content Area */}
          <div className="flex flex-1">
            {/* Sidebar Navigation */}
            <SettingsSidebar />

            {/* Content Area */}
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<CategoryManagement />} />
                <Route
                  path="/category/:categoryId"
                  element={<CategoryDetail />}
                />
                <Route path="/library" element={<AttributeLibrary />} />
                <Route path="/manufacturers" element={<ManufacturersView />} />
              </Routes>
            </main>
          </div>
        </div>

        <Toaster position="bottom-right" />
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
