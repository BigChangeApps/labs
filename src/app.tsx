import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/home";
import TokensPage from "@/tokens";
import AssetAttributesV1App from "@/prototypes/asset-attributes/v1/App";
import AssetAttributesV2App from "@/prototypes/asset-attributes/v2/App";
import BulkInvoicingApp from "@/prototypes/bulk-invoicing/v1/App";
import PlaygroundApp from "@/playground/App";
import { ComponentsShowcase } from "@/pages/components-showcase";
import { DevBar } from "@/components/DevBar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLanding } from "@/components/PublicLanding";

function App() {
  const showInternal = import.meta.env.VITE_SHOW_INTERNAL !== "false";

  return (
    <BrowserRouter>
      {showInternal && <DevBar />}
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
        <Route
          path="/bulk-invoicing/v1/*"
          element={
            <ProtectedRoute prototypeId="bulk-invoicing-v1">
              <BulkInvoicingApp />
            </ProtectedRoute>
          }
        />
        {/* Future prototypes will be added here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
