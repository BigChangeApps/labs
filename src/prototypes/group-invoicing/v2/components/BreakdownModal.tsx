import { useState, useMemo, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import { RadioGroup, RadioGroupItem } from "@/registry/ui/radio-group";
import { Label } from "@/registry/ui/label";
import { cn } from "@/registry/lib/utils";
import { type Job, formatCurrency } from "../lib/mock-data";

type BreakdownLevel = "contact" | "site";
type LevelOfDetail = "summary" | "partial" | "detailed";

interface BreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedJobs: Job[];
  onCreateInvoice: (breakdownLevel: BreakdownLevel, levelOfDetail: LevelOfDetail) => void;
  currentBreakdownLevel?: BreakdownLevel;
  currentLevelOfDetail?: LevelOfDetail;
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

export function BreakdownModal({ open, onOpenChange, selectedJobs, onCreateInvoice, currentBreakdownLevel = "contact", currentLevelOfDetail = "partial" }: BreakdownModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [breakdownLevel, setBreakdownLevel] = useState<BreakdownLevel>(currentBreakdownLevel);
  const [levelOfDetail, setLevelOfDetail] = useState<LevelOfDetail>(currentLevelOfDetail);
  
  // Update internal state when modal opens
  useEffect(() => {
    if (open) {
      setBreakdownLevel(currentBreakdownLevel);
      setLevelOfDetail(currentLevelOfDetail);
      setStep(1);
    }
  }, [open, currentBreakdownLevel, currentLevelOfDetail]);

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
      title: "Contact Level",
      description: summary.parentContacts.length === 1 
        ? "1 Overall invoice with merged totals."
        : `${summary.parentContacts.length} Overall invoices with merged totals.`,
    },
    {
      id: "site" as BreakdownLevel,
      title: "Site level",
      description: `${summary.siteCount} invoice${summary.siteCount !== 1 ? "s" : ""} (1 per site)`,
    },
  ];

  const levelOfDetailOptions = [
    {
      id: "summary" as LevelOfDetail,
      title: "Summary",
      description: "1 Line for all jobs (combined totals)",
    },
    {
      id: "partial" as LevelOfDetail,
      title: "Partial",
      description: "Separate lines for labour vs materials per job",
    },
    {
      id: "detailed" as LevelOfDetail,
      title: "Detailed",
      description: "Every line from every job",
    },
  ];

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleCreate = () => {
    onCreateInvoice(breakdownLevel, levelOfDetail);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[680px] max-w-[680px] h-[555px] p-0 gap-0 overflow-hidden !rounded-[8px] sm:!rounded-[8px] border border-[rgba(26,28,46,0.12)] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_16px_32px_0px_rgba(26,28,46,0.08),0px_2px_24px_0px_rgba(26,28,46,0.08)] flex flex-col [&[data-state=open]]:duration-200 [&[data-state=open]]:animate-in [&[data-state=open]]:fade-in-0 [&[data-state=closed]]:duration-150 [&[data-state=closed]]:animate-out [&[data-state=closed]]:fade-out-0">
        {/* Sticky Header */}
        <div className="px-6 py-4 bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)] shrink-0 flex flex-row items-start justify-between gap-2.5">
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <img 
                src="/brain-icon.png" 
                alt="" 
                className="size-4 shrink-0"
              />
              <p className="text-sm font-normal text-[#73777D] tracking-[-0.14px]">
                Step {step}/2
              </p>
            </div>
            <h2 className="text-base font-normal text-[#0B2642] tracking-[-0.16px]">
              {step === 1 ? "Select your grouping" : "Select your structure"}
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="size-6 shrink-0 flex items-center justify-center rounded-[8px] bg-white border border-[rgba(3,7,18,0.08)] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5 text-[#0B2642]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Summary Section */}
          <div className="px-6 py-5">
            <div className="bg-[#F8F9FC] rounded-[8px] p-5">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Total jobs selected</p>
                  <p className="text-sm font-bold text-[#0B2642] mt-1">{summary.totalJobs}</p>
                </div>
                <div>
                  <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Left to invoice</p>
                  <p className="text-sm font-bold text-[#0B2642] mt-1">{formatCurrency(summary.leftToInvoice)}</p>
                </div>
                <div>
                  <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Parent contacts</p>
                  <p className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] mt-1 truncate" title={summary.parentContacts.join(", ")}>
                    {parentContactsDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Sites</p>
                  <p className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] mt-1">{summary.siteCount}</p>
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

          {/* Step 1: Breakdown Options */}
          {step === 1 && (
            <div className="px-6 pb-5">
              <p className="text-sm font-normal text-[#0B2642] mb-4 tracking-[-0.14px]">How should we group your Invoices?</p>
              <RadioGroup
                value={breakdownLevel}
                onValueChange={(value) => setBreakdownLevel(value as BreakdownLevel)}
                className="flex gap-4"
              >
                {breakdownOptions.map((option) => {
                  const isSelected = breakdownLevel === option.id;
                  return (
                    <Label
                      key={option.id}
                      htmlFor={`breakdown-${option.id}`}
                      className={cn(
                        "flex-1 flex gap-3 p-4 rounded-[8px] transition-all text-left border h-[91px] cursor-pointer font-normal",
                        isSelected
                          ? "border-[#086DFF] bg-[rgba(8,109,255,0.16)]"
                          : "border-[rgba(26,28,46,0.12)] bg-white hover:border-[rgba(26,28,46,0.24)]"
                      )}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`breakdown-${option.id}`}
                        className="shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <p className={cn(
                          "text-sm font-medium tracking-[-0.14px]",
                          isSelected ? "text-[#086DFF]" : "text-[#1A1C2E]"
                        )}>
                          {option.title}
                        </p>
                        <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Level of Detail Options */}
          {step === 2 && (
            <div className="px-6 pb-5">
              <div className="flex flex-col gap-4">
                <p className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">Choose your invoice structure</p>
                <RadioGroup
                  value={levelOfDetail}
                  onValueChange={(value) => setLevelOfDetail(value as LevelOfDetail)}
                  className="flex gap-4"
                >
                  {levelOfDetailOptions.map((option) => {
                    const isSelected = levelOfDetail === option.id;
                    return (
                      <Label
                        key={option.id}
                        htmlFor={`detail-${option.id}`}
                        className={cn(
                          "flex-1 flex gap-3 p-4 rounded-[8px] transition-all text-left border h-[91px] cursor-pointer font-normal",
                          isSelected
                            ? "border-[#086DFF] bg-[rgba(8,109,255,0.16)]"
                            : "border-[rgba(26,28,46,0.12)] bg-white hover:border-[rgba(26,28,46,0.24)]"
                        )}
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={`detail-${option.id}`}
                          className="shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <p className={cn(
                            "text-sm font-medium tracking-[-0.14px]",
                            isSelected ? "text-[#086DFF]" : "text-[#1A1C2E]"
                          )}>
                            {option.title}
                          </p>
                          <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">
                            {option.description}
                          </p>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[rgba(26,28,46,0.12)] flex items-center justify-between bg-[#F8F9FC] shrink-0">
          {step === 1 ? (
            <>
              <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">
                This will create {invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}
              </p>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleNext}
              >
                Next step
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleCreate}
              >
                Create invoice
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
