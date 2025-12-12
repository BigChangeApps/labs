import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { type Job } from "../lib/mock-data";
import { JobSelectionModal } from "./JobSelectionModal";

// Status badge component
function DraftBadge() {
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-white border border-[rgba(16,25,41,0.1)]">
      <span className="text-xs font-medium text-[#0B2642] tracking-[-0.12px]">Default</span>
    </div>
  );
}

export function EmptyInvoiceState() {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  
  const locationState = (location.state || {}) as { 
    selectedJobs?: Job[];
  };
  
  const selectedJobs = locationState.selectedJobs || [];

  return (
    <div className="min-h-screen bg-[#FCFCFD] flex flex-col">
      {/* Subheader */}
      <header className="sticky top-0 z-10 bg-white border-b border-[rgba(26,28,46,0.12)]">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigate("/bulk-invoicing/v1")}
                className="text-sm font-medium text-[#475467] hover:text-[#0B2642] tracking-[-0.14px]"
              >
                Jobs ready to invoice
              </button>
              <ChevronRight className="h-4 w-4 text-[#475467]" />
              <span className="text-sm font-bold text-[#101929] tracking-[-0.14px]">Invoice/1234</span>
            </div>
            <DraftBadge />
          </div>
          <Button variant="outline" size="sm" className="bg-white">
            Save as draft
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)] w-full max-w-[600px]">
          <div className="flex flex-row items-center self-stretch">
            <div className="flex flex-col h-full items-start justify-center pl-8 pr-5 py-7 shrink-0">
              <div className="flex gap-6 items-center shrink-0">
                <div className="flex flex-col gap-2 items-start shrink-0">
                  <h2 className="text-xl font-bold leading-6 text-[#0B2642] tracking-[-0.2px] whitespace-pre">
                    Get Paid Quicker
                  </h2>
                  <p className="text-sm font-medium leading-5 text-[#73777D] tracking-[-0.14px] w-[275px]">
                    Start adding jobs to this invoice to get paid
                  </p>
                </div>
                <Button 
                  variant="default" 
                  size="default"
                  onClick={() => setModalOpen(true)}
                  className="gap-2 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Job Selection Modal */}
      <JobSelectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initiallySelectedJobs={selectedJobs}
      />
    </div>
  );
}

