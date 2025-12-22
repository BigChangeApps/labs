import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/ui/tooltip";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { JobsReadyToInvoice } from "./components/pages/JobsReadyToInvoice";
import { BulkInvoiceCreation } from "./components/pages/BulkInvoiceCreation";
import { GroupInvoiceView } from "./components/pages/GroupInvoiceView";
import { InvoicePreview } from "./components/pages/InvoicePreview";
import { EmptyInvoiceState } from "./components/pages/EmptyInvoiceState";
import { UnifiedInvoiceWorkspace } from "./components/pages/UnifiedInvoiceWorkspace";

function BulkInvoicingApp() {
  // #region agent log
  const location = useLocation();
  fetch('http://127.0.0.1:7242/ingest/cf7df69f-f856-4874-ac6a-b53ffb85f438',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:14',message:'v2 App RENDER',data:{pathname:location.pathname,note:'GlobalActionBar only on /workspace route'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  return (
    <TooltipProvider>
      <div className="h-screen bg-hw-background flex flex-col overflow-hidden">
        <PrototypeBanner deviceType="desktop" />
        <main className="flex-1 min-h-0">
          <Routes>
            <Route index element={<JobsReadyToInvoice />} />
            <Route path="create" element={<BulkInvoiceCreation />} />
            <Route path="empty" element={<EmptyInvoiceState />} />
            <Route path="group" element={<GroupInvoiceView />} />
            <Route path="preview" element={<InvoicePreview />} />
            <Route path="workspace" element={<UnifiedInvoiceWorkspace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default BulkInvoicingApp;

