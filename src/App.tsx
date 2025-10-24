import { BrowserRouter, Routes, Route } from "react-router-dom";
import Labs from "@/labs";
import AssetAttributesApp from "@/prototypes/asset-attributes/App";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Labs />} />
        {/* Prototype routes */}
        <Route path="/asset-attributes/*" element={<AssetAttributesApp />} />
        {/* Future prototypes will be added here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
