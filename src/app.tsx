import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Home from "@/home";
import TokensPage from "@/tokens";
import { DevBar } from "@/components/DevBar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLanding } from "@/components/PublicLanding";

// Lazy load prototypes and heavy components
const AssetAttributesV1App = lazy(() => import("@/prototypes/asset-attributes/v1/App"));
const AssetAttributesV2App = lazy(() => import("@/prototypes/asset-attributes/v2/App"));
const PlaygroundApp = lazy(() => import("@/playground/App"));
const ComponentsShowcase = lazy(() => 
  import("@/pages/components-showcase").then(module => ({ default: module.ComponentsShowcase }))
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-hw-text-secondary">Loading...</div>
  </div>
);

function App() {
  const showInternal = import.meta.env.VITE_SHOW_INTERNAL !== "false";

  return (
    <BrowserRouter>
      {showInternal && <DevBar />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={showInternal ? <Home /> : <PublicLanding />} />
          {showInternal && <Route path="/tokens" element={<TokensPage />} />}
          {/* Component playground and registry (internal only) */}
          {showInternal && (
            <>
              <Route path="/playground/*" element={<PlaygroundApp />} />
              <Route path="/components" element={<ComponentsShowcase />} />
            </>
          )}
          {/* Prototype routes */}
          <Route
            path="/asset-attributes/v1/*"
            element={
              <ProtectedRoute prototypeId="asset-attributes-v1">
                <AssetAttributesV1App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asset-attributes/v2/*"
            element={
              <ProtectedRoute prototypeId="asset-attributes-v2">
                <AssetAttributesV2App />
              </ProtectedRoute>
            }
          />
          {/* Future prototypes will be added here */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
