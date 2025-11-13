import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/home";
import TokensPage from "@/tokens";
import AssetAttributesApp from "@/prototypes/asset-attributes/App";
import AssetAttributesVariationApp from "@/prototypes/asset-attributes-variation/App";
import PlaygroundApp from "@/playground/App";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { BrandSwitcher } from "@/components/BrandSwitcher";
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
      <Routes>
        <Route path="/" element={<Home />} />
        {showInternal && <Route path="/tokens" element={<TokensPage />} />}
        {/* Component playground (internal only) */}
        {showInternal && (
          <Route path="/playground/*" element={<PlaygroundApp />} />
        )}
        {/* Prototype routes */}
        <Route
          path="/asset-attributes/*"
          element={
            <ProtectedRoute prototypeId="asset-attributes">
              <AssetAttributesApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/asset-attributes-variation/*"
          element={
            <ProtectedRoute prototypeId="asset-attributes-variation">
              <AssetAttributesVariationApp />
            </ProtectedRoute>
          }
        />
        {/* Future prototypes will be added here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
