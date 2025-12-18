import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/registry/ui/radio-group";
import { Label } from "@/registry/ui/label";
import {
  Dialog,
  DialogContent,
} from "@/registry/ui/dialog";
import { cn } from "@/registry/lib/utils";
import { formatCurrency } from "../lib/mock-data";
import type { JobWithLines, LevelOfDetail } from "./UnifiedInvoiceWorkspace";

interface EditJobsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: JobWithLines[];
  selectedJobIds: Set<string>;
  levelOfDetail: LevelOfDetail;
  onSave: (selectedJobIds: Set<string>, levelOfDetail: LevelOfDetail) => void;
}

// Category dot for job type
function JobTypeDot({ category }: { category: "blue" | "orange" | "purple" }) {
  const colors = {
    blue: "bg-[#0E94EB]",
    orange: "bg-[#FE8640]",
    purple: "bg-[#8C54CA]",
  };
  return <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", colors[category])} />;
}

export function EditJobsModal({
  open,
  onOpenChange,
  jobs,
  selectedJobIds,
  levelOfDetail,
  onSave,
}: EditJobsModalProps) {
  // Local state for editing
  const [localSelectedJobIds, setLocalSelectedJobIds] = useState<Set<string>>(
    new Set(selectedJobIds)
  );
  const [localLevelOfDetail, setLocalLevelOfDetail] = useState<LevelOfDetail>(levelOfDetail);

  // Reset local state when modal opens
  useMemo(() => {
    if (open) {
      setLocalSelectedJobIds(new Set(selectedJobIds));
      setLocalLevelOfDetail(levelOfDetail);
    }
  }, [open, selectedJobIds, levelOfDetail]);

  // Flatten jobs for display
  const allJobs = useMemo(() => {
    const result: { job: JobWithLines; categoryIndex: number }[] = [];
    let idx = 0;
    jobs.forEach((job) => {
      if (job.isGroupJob && job.childJobs) {
        job.childJobs.forEach((child) => {
          result.push({ job: child, categoryIndex: idx % 3 });
          idx++;
        });
      } else {
        result.push({ job, categoryIndex: idx % 3 });
        idx++;
      }
    });
    return result;
  }, [jobs]);

  // Calculate totals
  const { selectedCount, totalAmount } = useMemo(() => {
    let count = 0;
    let amount = 0;
    allJobs.forEach(({ job }) => {
      if (localSelectedJobIds.has(job.id)) {
        count++;
        amount += job.leftToInvoice;
      }
    });
    return { selectedCount: count, totalAmount: amount };
  }, [allJobs, localSelectedJobIds]);

  const toggleJob = (jobId: string) => {
    const newSelected = new Set(localSelectedJobIds);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setLocalSelectedJobIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedCount === allJobs.length) {
      // Deselect all
      setLocalSelectedJobIds(new Set());
    } else {
      // Select all
      const newSelected = new Set<string>();
      allJobs.forEach(({ job }) => newSelected.add(job.id));
      setLocalSelectedJobIds(newSelected);
    }
  };

  const handleSave = () => {
    onSave(localSelectedJobIds, localLevelOfDetail);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSelectedJobIds(new Set(selectedJobIds));
    setLocalLevelOfDetail(levelOfDetail);
    onOpenChange(false);
  };

  const getCategoryColor = (index: number): "blue" | "orange" | "purple" => {
    const colors: Array<"blue" | "orange" | "purple"> = ["blue", "orange", "purple"];
    return colors[index % 3];
  };

  const allSelected = selectedCount === allJobs.length;
  const someSelected = selectedCount > 0 && selectedCount < allJobs.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 gap-0 !rounded-lg overflow-hidden ring-0 shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08),0px_16px_32px_0px_rgba(11,38,66,0.08),0px_2px_24px_0px_rgba(11,38,66,0.08)]">
        {/* Header */}
        <div className="bg-[#F8F9FC] px-5 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0B2642] tracking-[-0.16px] leading-6">
            Edit Jobs
          </h2>
          <button
            onClick={handleCancel}
            className="size-6 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-[#0B2642]" />
          </button>
        </div>

        {/* Level of Detail Selector */}
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <p className="text-sm font-medium text-[#0B2642] mb-3 tracking-[-0.14px]">
            Level of detail
          </p>
          <RadioGroup
            value={localLevelOfDetail}
            onValueChange={(value) => setLocalLevelOfDetail(value as LevelOfDetail)}
            className="flex gap-3"
          >
            <Label
              htmlFor="edit-summary"
              className={cn(
                "flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                localLevelOfDetail === "summary"
                  ? "border-[#086DFF] bg-[rgba(8,109,255,0.08)]"
                  : "border-[rgba(26,28,46,0.12)] bg-white hover:border-[rgba(26,28,46,0.24)]"
              )}
            >
              <RadioGroupItem value="summary" id="edit-summary" />
              <span className={cn(
                "text-sm font-medium tracking-[-0.14px]",
                localLevelOfDetail === "summary" ? "text-[#086DFF]" : "text-[#0B2642]"
              )}>
                Summary
              </span>
            </Label>
            <Label
              htmlFor="edit-partial"
              className={cn(
                "flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                localLevelOfDetail === "partial"
                  ? "border-[#086DFF] bg-[rgba(8,109,255,0.08)]"
                  : "border-[rgba(26,28,46,0.12)] bg-white hover:border-[rgba(26,28,46,0.24)]"
              )}
            >
              <RadioGroupItem value="partial" id="edit-partial" />
              <span className={cn(
                "text-sm font-medium tracking-[-0.14px]",
                localLevelOfDetail === "partial" ? "text-[#086DFF]" : "text-[#0B2642]"
              )}>
                Partial
              </span>
            </Label>
            <Label
              htmlFor="edit-detailed"
              className={cn(
                "flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                localLevelOfDetail === "detailed"
                  ? "border-[#086DFF] bg-[rgba(8,109,255,0.08)]"
                  : "border-[rgba(26,28,46,0.12)] bg-white hover:border-[rgba(26,28,46,0.24)]"
              )}
            >
              <RadioGroupItem value="detailed" id="edit-detailed" />
              <span className={cn(
                "text-sm font-medium tracking-[-0.14px]",
                localLevelOfDetail === "detailed" ? "text-[#086DFF]" : "text-[#0B2642]"
              )}>
                Detailed
              </span>
            </Label>
          </RadioGroup>
        </div>

        {/* Jobs List */}
        <div className="px-5 py-4 max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
              Jobs ({selectedCount} of {allJobs.length} selected)
            </p>
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* Table */}
          <div className="border border-[rgba(26,28,46,0.12)] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)]">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
              />
              <span className="flex-1 text-sm font-medium text-[#73777D] tracking-[-0.14px]">
                Job Reference
              </span>
              <span className="w-[100px] text-sm font-medium text-[#73777D] tracking-[-0.14px] text-right">
                Site
              </span>
              <span className="w-[100px] text-sm font-medium text-[#73777D] tracking-[-0.14px] text-right">
                Amount
              </span>
            </div>

            {/* Rows */}
            {allJobs.map(({ job, categoryIndex }) => (
              <div
                key={job.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 border-b last:border-b-0 border-[rgba(26,28,46,0.08)] transition-colors",
                  localSelectedJobIds.has(job.id)
                    ? "bg-white"
                    : "bg-[#FCFCFD]"
                )}
              >
                <Checkbox
                  checked={localSelectedJobIds.has(job.id)}
                  onCheckedChange={() => toggleJob(job.id)}
                />
                <div className="flex-1 flex items-center gap-2">
                  <JobTypeDot category={getCategoryColor(categoryIndex)} />
                  <span className={cn(
                    "text-sm font-medium tracking-[-0.14px]",
                    localSelectedJobIds.has(job.id)
                      ? "text-[#0B2642]"
                      : "text-[rgba(11,38,66,0.4)] line-through"
                  )}>
                    {job.jobRef}
                  </span>
                </div>
                <span className={cn(
                  "w-[100px] text-sm tracking-[-0.14px] text-right truncate",
                  localSelectedJobIds.has(job.id)
                    ? "text-[#73777D]"
                    : "text-[rgba(11,38,66,0.3)]"
                )}>
                  {job.site || "-"}
                </span>
                <span className={cn(
                  "w-[100px] text-sm font-medium tracking-[-0.14px] text-right",
                  localSelectedJobIds.has(job.id)
                    ? "text-[#0B2642]"
                    : "text-[rgba(11,38,66,0.4)]"
                )}>
                  {formatCurrency(job.leftToInvoice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FC] px-5 py-4 flex items-center justify-end gap-3 rounded-b-lg">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

