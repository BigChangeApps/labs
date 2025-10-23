import { BrowserRouter, Routes, Route } from "react-router-dom";
import Labs from "@/labs/Labs";
import AssetAttributesApp from "@/prototypes/asset-attributes/App";
import DesignSystemPlaygroundApp from "@/prototypes/design-system-playground/App";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Labs />} />
        {/* Prototype routes */}
        <Route path="/design-system-playground/*" element={<DesignSystemPlaygroundApp />} />
        <Route path="/asset-attributes/*" element={<AssetAttributesApp />} />
        {/* Future prototypes will be added here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
