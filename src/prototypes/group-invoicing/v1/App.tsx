import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/registry/ui/tooltip";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { JobsReadyToInvoice } from "./components/JobsReadyToInvoice";
import { BulkInvoiceCreation } from "./components/BulkInvoiceCreation";
import { GroupInvoiceView } from "./components/GroupInvoiceView";
import { InvoicePreview } from "./components/InvoicePreview";
import { EmptyInvoiceState } from "./components/EmptyInvoiceState";

function BulkInvoicingApp() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-hw-background flex flex-col">
        <PrototypeBanner deviceType="desktop" />
        <main className="flex-1">
          <Routes>
            <Route index element={<JobsReadyToInvoice />} />
            <Route path="create" element={<BulkInvoiceCreation />} />
            <Route path="empty" element={<EmptyInvoiceState />} />
            <Route path="group" element={<GroupInvoiceView />} />
            <Route path="preview" element={<InvoicePreview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}

export default BulkInvoicingApp;

