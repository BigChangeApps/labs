import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/home";
import TokensPage from "@/tokens";
import AssetAttributesV1App from "@/prototypes/asset-attributes/v1/App";
import AssetAttributesV2App from "@/prototypes/asset-attributes/v2/App";
import PlaygroundApp from "@/playground/App";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { BrandSwitcher } from "@/components/BrandSwitcher";
import { DevBar } from "@/components/DevBar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  const showInternal = import.meta.env.VITE_SHOW_INTERNAL !== "false";

  return (
    <BrowserRouter>
      {showInternal && (
        <>
          <DarkModeToggle />
          <BrandSwitcher />
        </>
      )}
      <DevBar />
      <Routes>
        <Route path="/" element={<Home />} />
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
        {/* Future prototypes will be added here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
