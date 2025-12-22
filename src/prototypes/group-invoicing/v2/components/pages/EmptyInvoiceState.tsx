import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { type Job } from "../../lib/mock-data";
import { JobSelectionModal } from "../features/job-selection/JobSelectionModal";

export function EmptyInvoiceState() {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  
  const locationState = (location.state || {}) as { 
    selectedJobs?: Job[];
  };
  
  const selectedJobs = locationState.selectedJobs || [];

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Subheader */}
      <header className="sticky top-0 z-10 bg-white border-b border-hw-border">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/group-invoicing/v2")}
                className="p-0 h-auto text-sm font-medium text-hw-text-secondary hover:text-hw-text"
              >
                Jobs ready to invoice
              </Button>
              <ChevronRight className="h-4 w-4 text-hw-text-secondary" />
              <span className="text-sm font-bold text-hw-text tracking-[-0.14px]">Invoice/1234</span>
            </div>
            <Badge variant="secondary">Default</Badge>
          </div>
          <Button variant="outline" size="sm">
            Save as draft
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="bg-white rounded-card shadow-card w-full max-w-[600px]">
          <div className="flex flex-row items-center self-stretch">
            <div className="flex flex-col h-full items-start justify-center pl-8 pr-5 py-7 shrink-0">
              <div className="flex gap-6 items-center shrink-0">
                <div className="flex flex-col gap-2 items-start shrink-0">
                  <h2 className="text-xl font-bold leading-6 text-hw-text tracking-[-0.2px] whitespace-pre">
                    Get Paid Quicker
                  </h2>
                  <p className="text-sm font-medium leading-5 text-hw-text-secondary tracking-[-0.14px] w-[275px]">
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

