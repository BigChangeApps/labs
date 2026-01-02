import { useState, useMemo, useEffect } from "react";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import { Switch } from "@/registry/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/registry/ui/dialog";
import { cn } from "@/registry/lib/utils";
import { formatCurrency } from "../../../lib/mock-data";
import type { JobWithLines, LevelOfDetail, JobLineFinance } from "../../pages/UnifiedInvoiceWorkspace";

// Finance options for dropdowns
const nominalCodeOptions = [
  { id: "5001", label: "5001 - Sales Revenue" },
  { id: "5002", label: "5002 - Service Revenue" },
  { id: "5003", label: "5003 - Parts Revenue" },
];

const departmentOptions = [
  { id: "HS49301", label: "HS/49301 - Field Services" },
  { id: "HS49302", label: "HS/49302 - Maintenance" },
  { id: "HS49303", label: "HS/49303 - Installation" },
];

interface EditJobsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: JobWithLines[];
  selectedJobIds: Set<string>;
  levelOfDetail: LevelOfDetail;
  defaultFinance: JobLineFinance;
  onSave: (
    selectedJobIds: Set<string>,
    levelOfDetail: LevelOfDetail,
    updatedJobs: JobWithLines[]
  ) => void;
  onChange?: (selectedJobIds: Set<string>, levelOfDetail: LevelOfDetail) => void;
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

// Line item type with VAT and finance fields
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vat: number;
  category: "labour" | "materials" | "other";
  selected: boolean;
  jobId: string;
  nominalCode: string;
  departmentCode: string;
}

export function EditJobsModal({
  open,
  onOpenChange,
  jobs,
  selectedJobIds,
  levelOfDetail,
  defaultFinance,
  onSave,
  onChange,
}: EditJobsModalProps) {
  const [showAllLines, setShowAllLines] = useState(false);
  // Track internal selection state that can differ from props
  const [internalSelectedJobIds, setInternalSelectedJobIds] = useState<Set<string>>(() => new Set(selectedJobIds));
  // Track internal job state with finance changes
  const [internalJobs, setInternalJobs] = useState<JobWithLines[]>(() => [...jobs]);
  
  // Get first selected job for display
  const selectedJob = useMemo(() => {
    for (const job of internalJobs) {
      if (job.isGroupJob && job.childJobs) {
        for (const child of job.childJobs) {
          if (internalSelectedJobIds.has(child.id)) {
            return child;
          }
        }
      } else if (internalSelectedJobIds.has(job.id)) {
        return job;
      }
    }
    return internalJobs[0];
  }, [internalJobs, internalSelectedJobIds]);

  // Reset internal state when modal opens
  useEffect(() => {
    if (open) {
      setInternalSelectedJobIds(new Set(selectedJobIds));
      setInternalJobs([...jobs]);
      setLineFinanceOverrides(new Map());
    }
  }, [open, selectedJobIds, jobs]);

  // Track line-level finance changes
  const [lineFinanceOverrides, setLineFinanceOverrides] = useState<Map<string, { nominalCode: string; departmentCode: string }>>(new Map());

  // Generate line items based on jobs and selection state
  const lineItems = useMemo(() => {
    const items: LineItem[] = [];
    const vatRate = 0.20;
    
    internalJobs.forEach((job) => {
      const processJob = (j: JobWithLines) => {
        if (internalSelectedJobIds.has(j.id) || showAllLines) {
          const descriptions = [
            { category: "labour" as const, name: "Labour", qty: 7.5 },
            { category: "materials" as const, name: `No Nonsense 480 Acrylic Frame Sealant White 310ml`, qty: 10 },
            { category: "other" as const, name: `18V ONE+ Cordless Caulking Gun`, qty: 1 },
          ];
          
          descriptions.forEach((desc, i) => {
            const unitPrice = j.leftToInvoice * (i === 0 ? 0.6 : i === 1 ? 0.3 : 0.1) / desc.qty;
            const total = unitPrice * desc.qty;
            const lineId = `${j.id}-${desc.category}`;
            const override = lineFinanceOverrides.get(lineId);
            
            items.push({
              id: lineId,
              description: desc.name,
              quantity: desc.qty,
              unitPrice,
              total,
              vat: total * vatRate,
              category: desc.category,
              selected: internalSelectedJobIds.has(j.id),
              jobId: j.id,
              nominalCode: override?.nominalCode || defaultFinance.nominalCode,
              departmentCode: override?.departmentCode || defaultFinance.departmentCode,
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
  }, [internalJobs, internalSelectedJobIds, showAllLines, lineFinanceOverrides, defaultFinance]);

  // Calculate totals
  const { selectedCount, totalAmount } = useMemo(() => {
    const selected = lineItems.filter(item => item.selected);
    return {
      selectedCount: selected.length,
      totalAmount: selected.reduce((sum, item) => sum + item.total, 0),
    };
  }, [lineItems]);

  const toggleLineItem = (lineItem: LineItem) => {
    const newSelectedJobIds = new Set(internalSelectedJobIds);
    if (newSelectedJobIds.has(lineItem.jobId)) {
      newSelectedJobIds.delete(lineItem.jobId);
    } else {
      newSelectedJobIds.add(lineItem.jobId);
    }
    setInternalSelectedJobIds(newSelectedJobIds);
    onChange?.(newSelectedJobIds, levelOfDetail);
  };

  // Handle line-level nominal code change
  const handleLineNominalChange = (lineId: string, nominalCode: string) => {
    setLineFinanceOverrides((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(lineId);
      newMap.set(lineId, {
        nominalCode,
        departmentCode: existing?.departmentCode || defaultFinance.departmentCode,
      });
      return newMap;
    });
  };

  // Handle line-level department change
  const handleLineDepartmentChange = (lineId: string, departmentCode: string) => {
    setLineFinanceOverrides((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(lineId);
      newMap.set(lineId, {
        nominalCode: existing?.nominalCode || defaultFinance.nominalCode,
        departmentCode,
      });
      return newMap;
    });
  };

  const toggleAll = () => {
    const allSelected = lineItems.every(item => item.selected);
    const newSelectedJobIds = new Set<string>();
    
    if (!allSelected) {
      // Select all - add all job IDs from visible line items
      lineItems.forEach(item => newSelectedJobIds.add(item.jobId));
    }
    // If allSelected, we leave the set empty to deselect all
    
    setInternalSelectedJobIds(newSelectedJobIds);
    onChange?.(newSelectedJobIds, levelOfDetail);
  };

  const handleSave = () => {
    onSave(internalSelectedJobIds, levelOfDetail, internalJobs);
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
      <DialogContent className="max-w-[1100px] p-6 gap-0 !rounded-modal overflow-hidden ring-0 shadow-modal">
        {/* Header - Job Info */}
        <div className="bg-white flex flex-col gap-3 pb-4">
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
        <div className="bg-white rounded-lg border border-hw-border overflow-hidden max-h-[436px] overflow-y-auto overflow-x-auto">
          {/* Table Header */}
          <div className="flex items-center gap-3 h-10 px-4 bg-muted border-b border-hw-border sticky top-0 min-w-max">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={toggleAll}
              className="shrink-0"
            />
            <div className="flex-1 flex items-center gap-5">
              <div className="w-[200px]">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Name
                </span>
              </div>
              <div className="w-[160px]">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Nominal code
                </span>
              </div>
              <div className="w-[160px]">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Department
                </span>
              </div>
              <div className="w-12 text-right">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Qty
                </span>
              </div>
              <div className="w-[90px] text-right">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Unit price
                </span>
              </div>
              <div className="w-[90px] text-right">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Total
                </span>
              </div>
              <div className="w-[80px] text-right">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  VAT
                </span>
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {lineItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 min-h-[48px] px-4 bg-white border-b border-hw-border/50 last:border-b-0 min-w-max"
            >
              <Checkbox
                checked={item.selected}
                onCheckedChange={() => toggleLineItem(item)}
                className="shrink-0"
              />
              <div className="flex-1 flex items-center gap-5">
                <div className="w-[200px] flex items-center gap-2.5 py-2">
                  <ItemTypeDot category={item.category} />
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5 truncate">
                    {item.description}
                  </span>
                </div>
                <div className="w-[160px]">
                  <Select
                    value={item.nominalCode}
                    onValueChange={(value) => handleLineNominalChange(item.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {nominalCodeOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[160px]">
                  <Select
                    value={item.departmentCode}
                    onValueChange={(value) => handleLineDepartmentChange(item.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-12 text-right py-2">
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}
                  </span>
                </div>
                <div className="w-[90px] text-right py-2">
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    {formatCurrency(item.unitPrice)}
                  </span>
                </div>
                <div className="w-[90px] text-right py-2">
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="w-[80px] text-right py-2">
                  <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                    {formatCurrency(item.vat)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
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
