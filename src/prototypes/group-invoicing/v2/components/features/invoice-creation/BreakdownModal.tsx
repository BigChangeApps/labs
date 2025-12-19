import { useState, useMemo, useEffect } from "react";
import { X, ArrowLeft, Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/registry/ui/radio-group";
import { Label } from "@/registry/ui/label";
import { cn } from "@/registry/lib/utils";
import { type Job, formatCurrency } from "../../../lib/mock-data";

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
  const variantClasses = {
    scheduled: "bg-sky-100 border-sky-200 text-hw-text",
    progress: "bg-sky-600 border-sky-600 text-white hover:bg-sky-600",
    complete: "bg-green-700 border-green-700 text-white hover:bg-green-700",
  };

  return (
    <Badge variant="secondary" className={cn("px-1.5 py-0.5", variantClasses[variant])}>
      {count} {label}
    </Badge>
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
      <DialogContent className="w-[680px] max-w-[680px] h-[555px] p-0 gap-0 overflow-hidden !rounded-modal sm:!rounded-modal border border-hw-border shadow-modal flex flex-col [&[data-state=open]]:duration-200 [&[data-state=open]]:animate-in [&[data-state=open]]:fade-in-0 [&[data-state=closed]]:duration-150 [&[data-state=closed]]:animate-out [&[data-state=closed]]:fade-out-0">
        {/* Sticky Header */}
        <div className="px-6 py-4 bg-hw-surface-subtle border-b border-hw-border shrink-0 flex flex-row items-start justify-between gap-2.5">
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Brain className="size-4 shrink-0 text-hw-text-secondary" />
              <p className="text-sm font-normal text-hw-text-secondary tracking-[-0.14px]">
                Step {step}/2
              </p>
            </div>
            <h2 className="text-base font-normal text-hw-text tracking-[-0.16px]">
              {step === 1 ? "Select your grouping" : "Select your structure"}
            </h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="size-6 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Summary Section */}
          <div className="px-6 py-5">
            <div className="bg-hw-surface-subtle rounded-card p-5">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">Total jobs selected</p>
                  <p className="text-sm font-bold text-hw-text mt-1">{summary.totalJobs}</p>
                </div>
                <div>
                  <p className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">Left to invoice</p>
                  <p className="text-sm font-bold text-hw-text mt-1">{formatCurrency(summary.leftToInvoice)}</p>
                </div>
                <div>
                  <p className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">Parent contacts</p>
                  <p className="text-sm font-medium text-hw-text tracking-[-0.14px] mt-1 truncate" title={summary.parentContacts.join(", ")}>
                    {parentContactsDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">Sites</p>
                  <p className="text-sm font-medium text-hw-text tracking-[-0.14px] mt-1">{summary.siteCount}</p>
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
              <p className="text-sm font-normal text-hw-text mb-4 tracking-[-0.14px]">How should we group your Invoices?</p>
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
                        "flex-1 flex gap-3 p-4 rounded-card transition-all text-left border h-[91px] cursor-pointer font-normal",
                        isSelected
                          ? "border-hw-brand bg-hw-brand/16"
                          : "border-hw-border bg-white hover:border-hw-border/50"
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
                          isSelected ? "text-hw-brand" : "text-hw-text"
                        )}>
                          {option.title}
                        </p>
                        <p className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">
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
                <p className="text-sm font-normal text-hw-text tracking-[-0.14px]">Choose your invoice structure</p>
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
                          "flex-1 flex gap-3 p-4 rounded-card transition-all text-left border h-[91px] cursor-pointer font-normal",
                          isSelected
                            ? "border-hw-brand bg-hw-brand/16"
                            : "border-hw-border bg-white hover:border-hw-border/50"
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
                            isSelected ? "text-hw-brand" : "text-hw-text"
                          )}>
                            {option.title}
                          </p>
                          <p className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">
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
        <div className="px-6 py-4 border-t border-hw-border flex items-center justify-between bg-hw-surface-subtle shrink-0">
          {step === 1 ? (
            <>
              <p className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">
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
