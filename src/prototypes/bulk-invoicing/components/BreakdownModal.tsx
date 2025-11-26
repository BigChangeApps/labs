import { useState, useMemo } from "react";
import { User, Building2, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import { cn } from "@/registry/lib/utils";
import { type Job, formatCurrency } from "../lib/mock-data";

type BreakdownLevel = "contact" | "site" | "job";

interface BreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedJobs: Job[];
  onCreateInvoice: (breakdownLevel: BreakdownLevel) => void;
}

function StatusBadge({ count, label, variant }: { count: number; label: string; variant: "scheduled" | "progress" | "complete" }) {
  const variants = {
    scheduled: "bg-[#e6f3fa] border border-[rgba(2,136,209,0.2)] text-[#0b2642]",
    progress: "bg-[#0288d1] border border-[#0288d1] text-white",
    complete: "bg-[#2e7d32] border border-[#2e7d32] text-white",
  };

  return (
    <div className={cn("inline-flex items-center rounded-full px-[6px] py-[2px] text-xs font-medium leading-4 tracking-[-0.12px]", variants[variant])}>
      {count} {label}
    </div>
  );
}

export function BreakdownModal({ open, onOpenChange, selectedJobs, onCreateInvoice }: BreakdownModalProps) {
  const [breakdownLevel, setBreakdownLevel] = useState<BreakdownLevel>("contact");

  // Calculate summary data from selected jobs
  const summary = useMemo(() => {
    const totalJobs = selectedJobs.length;
    const leftToInvoice = selectedJobs.reduce((sum, job) => sum + job.leftToInvoice, 0);
    
    // Get unique parent contacts
    const parentContacts = [...new Set(selectedJobs.map(job => job.parent))];
    
    // Get unique sites
    const sites = [...new Set(selectedJobs.map(job => job.site))];
    
    // Count statuses
    const statusCounts = selectedJobs.reduce((acc, job) => {
      if (job.status === "Scheduled") acc.scheduled++;
      else if (job.status === "In progress") acc.inProgress++;
      else if (job.status === "Complete" || job.status === "Invoiced") acc.complete++;
      return acc;
    }, { scheduled: 0, inProgress: 0, complete: 0 });

    return {
      totalJobs,
      leftToInvoice,
      parentContacts,
      sites,
      siteCount: sites.length,
      statusCounts,
    };
  }, [selectedJobs]);

  // Calculate number of invoices based on breakdown level
  const invoiceCount = useMemo(() => {
    switch (breakdownLevel) {
      case "contact":
        return summary.parentContacts.length;
      case "site":
        return summary.siteCount;
      case "job":
        return summary.totalJobs;
      default:
        return 1;
    }
  }, [breakdownLevel, summary]);

  // Format parent contacts display - keep on one line with truncation
  const parentContactsDisplay = useMemo(() => {
    if (summary.parentContacts.length === 0) return "—";
    if (summary.parentContacts.length === 1) {
      return summary.parentContacts[0];
    }
    if (summary.parentContacts.length === 2) {
      return `${summary.parentContacts[0]}, ${summary.parentContacts[1]}`;
    }
    return `${summary.parentContacts[0]}, +${summary.parentContacts.length - 1} more`;
  }, [summary.parentContacts]);

  const breakdownOptions = [
    {
      id: "contact" as BreakdownLevel,
      icon: User,
      title: "Contact Level",
      description: `${summary.parentContacts.length} invoice${summary.parentContacts.length !== 1 ? "s" : ""} (Merged totals)`,
    },
    {
      id: "site" as BreakdownLevel,
      icon: Building2,
      title: "Site Level",
      description: `${summary.siteCount} Invoice${summary.siteCount !== 1 ? "s" : ""}, (1 per every site)`,
    },
    {
      id: "job" as BreakdownLevel,
      icon: Briefcase,
      title: "Job Level",
      description: `${summary.totalJobs} invoice${summary.totalJobs !== 1 ? "s" : ""} (1 invoice for each job)`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[680px] max-w-[680px] h-[590px] p-0 gap-0 overflow-hidden rounded-xl border border-[rgba(26,28,46,0.12)] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_8px_24px_-4px_rgba(11,38,66,0.16)] flex flex-col [&[data-state=open]]:duration-200 [&[data-state=open]]:animate-in [&[data-state=open]]:fade-in-0 [&[data-state=closed]]:duration-150 [&[data-state=closed]]:animate-out [&[data-state=closed]]:fade-out-0">
        {/* Sticky Header */}
        <DialogHeader className="px-6 py-4 bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)] shrink-0">
          <DialogTitle className="text-base font-normal text-[#0B2642] tracking-[-0.16px]">
            Select your breakdown
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Summary Section */}
          <div className="px-6 py-5">
            <div className="bg-[#F8F9FC] rounded-lg p-4">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Total jobs selected</p>
                  <p className="text-sm font-bold text-[#0B2642] mt-0.5">{summary.totalJobs}</p>
                </div>
                <div>
                  <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Left to invoice</p>
                  <p className="text-sm font-bold text-[#0B2642] mt-0.5">{formatCurrency(summary.leftToInvoice)}</p>
                </div>
                <div>
                  <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Parent contacts</p>
                  <p className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] mt-0.5 truncate" title={summary.parentContacts.join(", ")}>
                    {parentContactsDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Sites</p>
                  <p className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] mt-0.5">{summary.siteCount}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 flex-wrap mt-4">
                {summary.statusCounts.scheduled > 0 && (
                  <StatusBadge count={summary.statusCounts.scheduled} label="Scheduled" variant="scheduled" />
                )}
                {summary.statusCounts.inProgress > 0 && (
                  <StatusBadge count={summary.statusCounts.inProgress} label="In progress" variant="progress" />
                )}
                {summary.statusCounts.complete > 0 && (
                  <StatusBadge count={summary.statusCounts.complete} label="Complete" variant="complete" />
                )}
              </div>
            </div>
          </div>

          {/* Breakdown Options */}
          <div className="px-6 pb-5">
            <p className="text-sm font-normal text-[#0B2642] mb-3 tracking-[-0.14px]">Choose your invoice structure</p>
            <div className="space-y-2">
              {breakdownOptions.map((option) => {
                const isSelected = breakdownLevel === option.id;
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setBreakdownLevel(option.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                      isSelected
                        ? "border-2 border-[#086DFF] bg-[rgba(8,109,255,0.08)]"
                        : "border border-[rgba(26,28,46,0.12)] bg-[#fcfcfd] shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)] hover:border-[rgba(26,28,46,0.24)]"
                    )}
                  >
                    <div className="flex items-center justify-center size-8 rounded-lg shrink-0 bg-white border border-[rgba(26,28,46,0.12)]">
                      <IconComponent className="h-5 w-5 text-[#0B2642]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium tracking-[-0.14px] text-[#0B2642]">
                        {option.title}
                      </p>
                      <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[rgba(26,28,46,0.12)] flex items-center justify-between bg-[#F8F9FC] shrink-0">
          <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">
            This will create {invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}
          </p>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onCreateInvoice(breakdownLevel)}
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
