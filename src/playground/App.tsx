import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/ui/tooltip";
import { Layout } from "./components/layout";
import { getFirstComponent } from "./lib/registry";

// Component demos
import { CategoryGroupEditorDemo } from "./components/category-group-editor";
import { CategorySearchDemo } from "./components/category-search";
import { NavigationDemo } from "./components/navigation";

function PlaygroundApp() {
  const location = useLocation();
  const firstComponent = getFirstComponent();

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
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route element={<Layout />}>
              <Route
                index
                element={
                  firstComponent ? (
                    <Navigate to={firstComponent.path} replace state={location.state} />
                  ) : (
                    <div className="text-center text-muted-foreground">No components available</div>
                  )
                }
              />
              <Route path="category-group-editor" element={<CategoryGroupEditorDemo />} />
              <Route path="category-search" element={<CategorySearchDemo />} />
              <Route path="navigation" element={<NavigationDemo />} />
            </Route>
          </Routes>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default PlaygroundApp;
