import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/home";
import TokensPage from "@/tokens";
import AssetAttributesV1App from "@/prototypes/asset-attributes/v1/App";
import AssetAttributesV2App from "@/prototypes/asset-attributes/v2/App";
import AssetServiceAgreementsV1App from "@/prototypes/asset-service-agreements/v1/App";
import PlaygroundApp from "@/playground/App";
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
        {/* Component playground (internal only) */}
        {showInternal && (
          <Route path="/playground/*" element={<PlaygroundApp />} />
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
          path="/asset-service-agreements/v1/*"
          element={
            <ProtectedRoute prototypeId="asset-service-agreements-v1">
              <AssetServiceAgreementsV1App />
            </ProtectedRoute>
          }
        />
        {/* Future prototypes will be added here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
