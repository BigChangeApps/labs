import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/home";
import TokensPage from "@/tokens";
import AssetAttributesApp from "@/prototypes/asset-attributes/App";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tokens" element={<TokensPage />} />
        {/* Prototype routes */}
        <Route path="/asset-attributes/*" element={<AssetAttributesApp />} />
        {/* Future prototypes will be added here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
