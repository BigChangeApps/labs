import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/ui/tooltip";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { JobsReadyToInvoice } from "./components/JobsReadyToInvoice";
import { BulkInvoiceCreation } from "./components/BulkInvoiceCreation";
import { GroupInvoiceView } from "./components/GroupInvoiceView";
import { InvoicePreview } from "./components/InvoicePreview";
import { EmptyInvoiceState } from "./components/EmptyInvoiceState";
import { UnifiedInvoiceWorkspace } from "./components/UnifiedInvoiceWorkspace";

function BulkInvoicingApp() {
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

