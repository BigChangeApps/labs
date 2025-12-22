import { useState, useMemo } from "react";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import { Switch } from "@/registry/ui/switch";
import {
  Dialog,
  DialogContent,
} from "@/registry/ui/dialog";
import { cn } from "@/registry/lib/utils";
import { formatCurrency } from "../../../lib/mock-data";
import type { JobWithLines, LevelOfDetail } from "../../pages/UnifiedInvoiceWorkspace";

interface EditJobsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: JobWithLines[];
  selectedJobIds: Set<string>;
  levelOfDetail: LevelOfDetail;
  onSave: (selectedJobIds: Set<string>, levelOfDetail: LevelOfDetail) => void;
}

// Category dot for line item type
function ItemTypeDot({ category }: { category: "labour" | "materials" | "other" }) {
  const colors = {
    labour: "bg-sky-500",
    materials: "bg-orange-500",
    other: "bg-purple-500",
  };
  return <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", colors[category])} />;
}

// Resource avatar
function ResourceAvatar({ initials, image }: { initials: string; image?: string }) {
  return (
    <div className="relative size-[18px]">
      <div className="absolute inset-0 rounded-full bg-white shadow-card overflow-hidden">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-[5%] rounded-full bg-hw-surface-subtle flex items-center justify-center">
            <span className="text-[8px] font-semibold text-hw-text-secondary leading-none">
              {initials}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Line item type
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: "labour" | "materials" | "other";
  selected: boolean;
}

export function EditJobsModal({
  open,
  onOpenChange,
  jobs,
  selectedJobIds,
  levelOfDetail,
  onSave,
}: EditJobsModalProps) {
  const [showAllLines, setShowAllLines] = useState(false);
  
  // Get first selected job for display
  const selectedJob = useMemo(() => {
    for (const job of jobs) {
      if (job.isGroupJob && job.childJobs) {
        for (const child of job.childJobs) {
          if (selectedJobIds.has(child.id)) {
            return child;
          }
        }
      } else if (selectedJobIds.has(job.id)) {
        return job;
      }
    }
    return jobs[0];
  }, [jobs, selectedJobIds]);

  // Generate line items from selected jobs
  const [lineItems, setLineItems] = useState<LineItem[]>(() => {
    const items: LineItem[] = [];

    jobs.forEach((job) => {
      const processJob = (j: JobWithLines) => {
        if (selectedJobIds.has(j.id) || showAllLines) {
          // Generate mock line items for the job
          const descriptions = [
            { category: "labour" as const, name: "Labour", qty: 7.5 },
            { category: "materials" as const, name: `${j.jobRef} Materials`, qty: 10 },
            { category: "other" as const, name: `${j.jobRef} Other charges`, qty: 1 },
          ];
          
          descriptions.forEach((desc, i) => {
            const unitPrice = j.leftToInvoice * (i === 0 ? 0.6 : i === 1 ? 0.3 : 0.1) / desc.qty;
            items.push({
              id: `${j.id}-${desc.category}`,
              description: desc.name,
              quantity: desc.qty,
              unitPrice,
              total: unitPrice * desc.qty,
              category: desc.category,
              selected: selectedJobIds.has(j.id),
            });
          });
        }
      };

      if (job.isGroupJob && job.childJobs) {
        job.childJobs.forEach(processJob);
      } else {
        processJob(job);
      }
    });
    
    return items;
  });

  // Recalculate line items when showAllLines changes
  useMemo(() => {
    const items: LineItem[] = [];
    
    jobs.forEach((job) => {
      const processJob = (j: JobWithLines) => {
        if (selectedJobIds.has(j.id) || showAllLines) {
          const descriptions = [
            { category: "labour" as const, name: "Labour", qty: 7.5 },
            { category: "materials" as const, name: `No Nonsense 480 Acrylic Frame Sealant White 310ml`, qty: 10 },
            { category: "other" as const, name: `18V ONE+ Cordless Caulking Gun`, qty: 1 },
          ];
          
          descriptions.forEach((desc, i) => {
            const unitPrice = j.leftToInvoice * (i === 0 ? 0.6 : i === 1 ? 0.3 : 0.1) / desc.qty;
            items.push({
              id: `${j.id}-${desc.category}`,
              description: desc.name,
              quantity: desc.qty,
              unitPrice,
              total: unitPrice * desc.qty,
              category: desc.category,
              selected: selectedJobIds.has(j.id),
            });
          });
        }
      };

      if (job.isGroupJob && job.childJobs) {
        job.childJobs.forEach(processJob);
      } else {
        processJob(job);
      }
    });
    
    setLineItems(items);
  }, [jobs, selectedJobIds, showAllLines]);

  // Calculate totals
  const { selectedCount, totalAmount } = useMemo(() => {
    const selected = lineItems.filter(item => item.selected);
    return {
      selectedCount: selected.length,
      totalAmount: selected.reduce((sum, item) => sum + item.total, 0),
    };
  }, [lineItems]);

  const toggleLineItem = (id: string) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const toggleAll = () => {
    const allSelected = lineItems.every(item => item.selected);
    setLineItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
  };

  const handleSave = () => {
    // For now, just keep the existing job selection
    onSave(selectedJobIds, levelOfDetail);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const allSelected = lineItems.length > 0 && lineItems.every(item => item.selected);
  const someSelected = lineItems.some(item => item.selected) && !allSelected;

  // Format job date
  const formatJobDate = (dateStr?: string) => {
    if (!dateStr) return "Wed 21 May 2025";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[989px] p-0 gap-0 !rounded-modal overflow-hidden ring-0 shadow-modal">
        {/* Header - Job Info */}
        <div className="bg-white px-5 py-4 flex flex-col gap-3">
          {/* Job reference and total */}
          <div className="flex items-start justify-between">
            <span className="text-base font-bold text-hw-text tracking-[-0.16px] leading-6">
              {selectedJob?.jobRef || "INT/03910"}
            </span>
            <span className="text-base font-bold text-hw-text tracking-[-0.16px] leading-6">
              {formatCurrency(totalAmount || selectedJob?.leftToInvoice || 806.64)}
            </span>
          </div>

          {/* Job metadata */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
              {formatJobDate(selectedJob?.completed)}
            </span>
            <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
              {selectedJob?.jobCategory || "Internal Sealant"}
            </span>
            <div className="flex items-center gap-1.5">
              <ResourceAvatar initials="CS" />
              <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                Charlotte Stanton
              </span>
            </div>
          </div>

          {/* Show all lines toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={showAllLines}
              onCheckedChange={setShowAllLines}
            />
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              Show all lines
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-card overflow-hidden max-h-[436px] overflow-y-auto">
          {/* Table Header */}
          <div className="flex items-center gap-3 h-10 pl-3 pr-4 bg-muted border-b border-hw-border sticky top-0">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={toggleAll}
              className="shrink-0"
            />
            <div className="flex-1 flex items-center gap-5">
              <div className="flex-1">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Name
                </span>
              </div>
              <div className="w-[100px]" />
              <div className="w-6 text-right">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Qty
                </span>
              </div>
              <div className="w-[100px] text-right">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Unit price
                </span>
              </div>
              <div className="w-[100px] text-right">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {lineItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 min-h-[40px] max-h-[56px] pl-3 pr-4 bg-white"
            >
              <Checkbox
                checked={item.selected}
                onCheckedChange={() => toggleLineItem(item.id)}
                className="shrink-0"
              />
              <div className="flex-1 flex items-center gap-5">
                <div className="flex-1 flex items-center gap-2.5 py-2">
                  <ItemTypeDot category={item.category} />
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5 truncate">
                    {item.description}
                  </span>
                </div>
                <div className="w-[100px]" />
                <div className="w-6 text-right py-2">
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}
                  </span>
                </div>
                <div className="w-[100px] text-right py-2">
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    {formatCurrency(item.unitPrice)}
                  </span>
                </div>
                <div className="w-[100px] text-right py-2">
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 h-14">
          {/* Line count badge */}
          <div className="inline-flex items-center px-1.5 py-0.5 bg-white border border-hw-border rounded-md">
            <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
              {selectedCount} {selectedCount === 1 ? 'line' : 'lines'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
