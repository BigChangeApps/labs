import { useMemo, useRef, useState } from "react";
import {
  Paperclip,
  FileText,
  X,
  Building2,
  ChevronDown,
  Info,
  Download,
  Printer,
  ExternalLink,
  Eye,
  Settings,
  Plus,
  Trash2,
  Send,
  CheckCircle,
} from "lucide-react";
import { useFeatureFlag } from "@/components/FeatureFlagsPopover";
import { format } from "date-fns";
import { Button } from "@/registry/ui/button";
import { Textarea } from "@/registry/ui/textarea";
import { Calendar } from "@/registry/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/ui/dropdown-menu";
import { cn } from "@/registry/lib/utils";
import { formatCurrency } from "../../../lib/mock-data";
import { EditJobsModal } from "../job-selection/EditJobsModal";
import type {
  InvoiceData,
  JobWithLines,
  Attachment,
  UniversalSettings,
  LevelOfDetail,
  CustomLineItem,
  JobLineFinance,
} from "../../pages/UnifiedInvoiceWorkspace";

interface LiveInvoicePreviewProps {
  invoice: InvoiceData;
  onUpdateInvoice: (updates: Partial<InvoiceData>) => void;
  universalSettings: UniversalSettings;
  onSendInvoice: () => void;
  isSent: boolean;
}

// Logo uploader component
function LogoUploader({
  logo,
  onLogoChange,
}: {
  logo?: string;
  onLogoChange: (logo: string | undefined) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onLogoChange(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onLogoChange(undefined);
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/png,image/jpeg,image/svg+xml"
      />
      
      {logo ? (
        <div className="relative w-[160px] h-[68px] rounded-sm border border-hw-border overflow-hidden group">
          <img
            src={logo}
            alt="Invoice logo"
            className="w-full h-full object-contain bg-white"
          />
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-hw-text-secondary" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-[160px] h-[68px] flex items-center justify-center rounded-sm bg-hw-surface-subtle border border-hw-border hover:bg-hw-surface-hover transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px]">Add logo</span>
        </button>
      )}
    </div>
  );
}

// Category dot for job type in table
function JobTypeDot({ category }: { category: "blue" | "orange" | "purple" }) {
  const colors = {
    blue: "bg-sky-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };
  return <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", colors[category])} />;
}

// Line item type for detailed view
interface LineItemRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: "labour" | "materials" | "other";
  selected: boolean;
  // V3: Line-level finance
  finance?: JobLineFinance;
  jobId: string; // Track which job this line belongs to
}

// Jobs table component for the invoice preview
function JobsTable({
  jobs,
  selectedJobIds,
  levelOfDetail,
  customLines = [],
  onAddCustomLine,
  onRemoveCustomLine,
  showAddButton = false,
}: {
  jobs: JobWithLines[];
  selectedJobIds: Set<string>;
  levelOfDetail: "summary" | "partial" | "detailed";
  customLines?: CustomLineItem[];
  onAddCustomLine?: (line: CustomLineItem) => void;
  onRemoveCustomLine?: (lineId: string) => void;
  showAddButton?: boolean;
}) {
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [newLine, setNewLine] = useState<Omit<CustomLineItem, "id">>({
    category: "labour",
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  const handleAddLine = () => {
    if (!newLine.description || newLine.unitPrice <= 0) return;
    
    onAddCustomLine?.({
      id: `custom-${Date.now()}`,
      ...newLine,
    });
    
    setNewLine({
      category: "labour",
      description: "",
      quantity: 1,
      unitPrice: 0,
    });
    setIsAddingLine(false);
  };

  // Calculate overall total for summary view
  const overallTotal = useMemo(() => {
    let total = 0;
    jobs.forEach((job) => {
      if (job.isGroupJob && job.childJobs) {
        job.childJobs.forEach((child) => {
          if (selectedJobIds.has(child.id)) {
            total += child.leftToInvoice;
          }
        });
      } else if (selectedJobIds.has(job.id)) {
        total += job.leftToInvoice;
      }
    });
    return total;
  }, [jobs, selectedJobIds]);

  // Generate table rows based on levelOfDetail
  const { partialRows, detailedRows } = useMemo(() => {
    const partial: { id: string; jobRef: string; unitPrice: number; total: number; categoryIndex: number }[] = [];
    const detailed: LineItemRow[] = [];
    let categoryIndex = 0;
    
    jobs.forEach((job) => {
      if (job.isGroupJob && job.childJobs) {
        job.childJobs.forEach((child) => {
          if (selectedJobIds.has(child.id)) {
            // Partial row
            partial.push({
              id: child.id,
              jobRef: child.jobRef,
              unitPrice: child.leftToInvoice / (child.linesCount || 1),
              total: child.leftToInvoice,
              categoryIndex: categoryIndex % 3,
            });
            
            // Detailed rows (line items)
            const labourAmount = child.leftToInvoice * 0.6;
            const materialsAmount = child.leftToInvoice * 0.3;
            const otherAmount = child.leftToInvoice * 0.1;
            const childFinance = child.finance;
            
            detailed.push(
              { id: `${child.id}-labour`, description: "Labour charges", quantity: 1, unitPrice: labourAmount, total: labourAmount, category: "labour", selected: true, jobId: child.id, finance: childFinance },
              { id: `${child.id}-materials`, description: "Materials and parts", quantity: 1, unitPrice: materialsAmount, total: materialsAmount, category: "materials", selected: true, jobId: child.id, finance: childFinance },
              { id: `${child.id}-other`, description: "Other charges", quantity: 1, unitPrice: otherAmount, total: otherAmount, category: "other", selected: true, jobId: child.id, finance: childFinance }
            );
            
            categoryIndex++;
          }
        });
      } else {
        if (selectedJobIds.has(job.id)) {
          // Partial row
          partial.push({
            id: job.id,
            jobRef: job.jobRef,
            unitPrice: job.leftToInvoice / (job.linesCount || 1),
            total: job.leftToInvoice,
            categoryIndex: categoryIndex % 3,
          });
          
          // Detailed rows (line items)
          const labourAmount = job.leftToInvoice * 0.6;
          const materialsAmount = job.leftToInvoice * 0.3;
          const otherAmount = job.leftToInvoice * 0.1;
          const jobFinance = job.finance;
          
          detailed.push(
            { id: `${job.id}-labour`, description: "Labour charges", quantity: 1, unitPrice: labourAmount, total: labourAmount, category: "labour", selected: true, jobId: job.id, finance: jobFinance },
            { id: `${job.id}-materials`, description: "Materials and parts", quantity: 1, unitPrice: materialsAmount, total: materialsAmount, category: "materials", selected: true, jobId: job.id, finance: jobFinance },
            { id: `${job.id}-other`, description: "Other charges", quantity: 1, unitPrice: otherAmount, total: otherAmount, category: "other", selected: true, jobId: job.id, finance: jobFinance }
          );
          
          categoryIndex++;
        }
      }
    });
    
    return { partialRows: partial, detailedRows: detailed };
  }, [jobs, selectedJobIds]);

  const getCategoryColor = (index: number): "blue" | "orange" | "purple" => {
    const colors: Array<"blue" | "orange" | "purple"> = ["blue", "orange", "purple"];
    return colors[index % 3];
  };

  const getLineItemColor = (category: "labour" | "materials" | "other"): "blue" | "orange" | "purple" => {
    const map: Record<string, "blue" | "orange" | "purple"> = {
      labour: "blue",
      materials: "orange",
      other: "purple",
    };
    return map[category];
  };

  // Custom line row component
  const CustomLineRow = ({ line, onRemove }: { line: CustomLineItem; onRemove?: () => void }) => (
    <div className="flex items-center gap-5 min-h-[40px] max-h-[56px] group">
      <div className="flex-1 flex items-center gap-2.5 py-2">
        <JobTypeDot category={getLineItemColor(line.category)} />
        <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
          {line.description}
        </span>
        <span className="text-xs text-hw-text-secondary px-1.5 py-0.5 bg-hw-surface-subtle rounded">
          Custom
        </span>
      </div>
      <div className="w-[100px]" />
      <div className="w-[100px] text-right py-2">
        <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
          {formatCurrency(line.unitPrice)}
        </span>
      </div>
      <div className="w-[100px] text-right flex items-center justify-end gap-2 py-2">
        <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
          {formatCurrency(line.quantity * line.unitPrice)}
        </span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-hw-surface-subtle opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5 text-hw-text-secondary" />
          </button>
        )}
      </div>
    </div>
  );

  // Add line form component
  const AddLineForm = () => (
    <div className="border-t border-hw-border p-4 bg-hw-surface-subtle">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 w-[120px]">
            <label className="text-xs font-medium text-hw-text-secondary">Category</label>
            <select
              value={newLine.category}
              onChange={(e) => setNewLine({ ...newLine, category: e.target.value as "labour" | "materials" | "other" })}
              className="h-9 px-3 rounded-input ring-1 ring-hw-border bg-white text-sm"
            >
              <option value="labour">Labour</option>
              <option value="materials">Materials</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-hw-text-secondary">Description</label>
            <input
              type="text"
              placeholder="Enter description..."
              value={newLine.description}
              onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
              className="h-9 px-3 rounded-input ring-1 ring-hw-border bg-white text-sm text-hw-text"
            />
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex flex-col gap-1.5 w-20">
            <label className="text-xs font-medium text-hw-text-secondary">Quantity</label>
            <input
              type="number"
              min="1"
              value={newLine.quantity}
              onChange={(e) => setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 1 })}
              className="h-9 px-3 rounded-input ring-1 ring-hw-border bg-white text-sm text-hw-text"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-32">
            <label className="text-xs font-medium text-hw-text-secondary">Unit price</label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={newLine.unitPrice || ""}
              onChange={(e) => setNewLine({ ...newLine, unitPrice: parseFloat(e.target.value) || 0 })}
              className="h-9 px-3 rounded-input ring-1 ring-hw-border bg-white text-sm text-hw-text"
            />
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setIsAddingLine(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleAddLine} disabled={!newLine.description || newLine.unitPrice <= 0}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );

  // SUMMARY VIEW - Single consolidated row
  if (levelOfDetail === "summary") {
    return (
      <div className="flex flex-col overflow-hidden rounded-lg">
        {/* Table Header */}
        <div className="flex items-center gap-5 h-10 border-b border-hw-border">
          <div className="flex-1 py-2">
            <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
              Name
            </span>
          </div>
          <div className="w-[100px]" />
          <div className="w-[100px] text-right py-2">
            <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
              Unit price
            </span>
          </div>
          <div className="w-[100px] text-right py-2">
            <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
              Total
            </span>
          </div>
        </div>

        {/* Single Summary Row */}
        <div className="flex items-center gap-5 min-h-[40px] max-h-[56px]">
          <div className="flex-1 flex items-center gap-2.5 py-2">
            <JobTypeDot category="blue" />
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              Overall work
            </span>
          </div>
          <div className="w-[100px]" />
          <div className="w-[100px] text-right py-2">
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              {formatCurrency(overallTotal)}
            </span>
          </div>
          <div className="w-[100px] text-right py-2">
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              {formatCurrency(overallTotal)}
            </span>
          </div>
        </div>

        {/* Custom Lines */}
        {customLines.map((line) => (
          <CustomLineRow
            key={line.id}
            line={line}
            onRemove={onRemoveCustomLine ? () => onRemoveCustomLine(line.id) : undefined}
          />
        ))}

        {/* Add Line Button or Form */}
        {showAddButton && !isAddingLine && (
          <button
            onClick={() => setIsAddingLine(true)}
            className="w-full flex items-center gap-2 px-3 py-3 text-sm font-medium text-hw-brand hover:bg-hw-surface-subtle transition-colors border-t border-hw-border"
          >
            <Plus className="h-4 w-4" />
            Add line
          </button>
        )}
        {isAddingLine && <AddLineForm />}
      </div>
    );
  }

  // DETAILED VIEW - Line items with finance display
  if (levelOfDetail === "detailed") {
    return (
      <div className="flex flex-col overflow-hidden rounded-lg">
        {/* Table Header */}
        <div className="flex items-center gap-5 h-10 border-b border-hw-border">
          <div className="flex-1 py-2">
            <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
              Line item
            </span>
          </div>
          <div className="w-[180px] py-2">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
                Finance
              </span>
              <span className="text-[10px] text-hw-text-secondary/70 leading-3">
                Inherits from job settings
              </span>
            </div>
          </div>
          <div className="w-[90px] text-right py-2">
            <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
              Unit price
            </span>
          </div>
          <div className="w-[90px] text-right py-2">
            <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
              Total
            </span>
          </div>
        </div>

        {/* Detailed Rows with inline finance display */}
        {detailedRows.map((row) => {
          const lineFinance = row.finance || defaultFinance || { nominalCode: "5001", departmentCode: "HS49301", inherited: true };
          const isOverridden = row.finance && !row.finance.inherited;
          
          return (
            <div
              key={row.id}
              className="flex items-center gap-5 min-h-[44px]"
            >
              <div className="flex-1 flex items-center gap-2.5 min-w-0 py-2">
                <JobTypeDot category={getLineItemColor(row.category)} />
                <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5 truncate">
                  {row.description}
                </span>
              </div>
              <div className="w-[180px] py-2">
                {isOverridden ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-amber-700">
                      {lineFinance.nominalCode} / {lineFinance.departmentCode.replace('HS', 'HS/')}
                    </span>
                    <span className="text-[9px] font-medium text-amber-700 bg-amber-100 px-1 py-0.5 rounded shrink-0">
                      Custom
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-hw-text-secondary italic">
                    {lineFinance.nominalCode} / {lineFinance.departmentCode.replace('HS', 'HS/')}
                  </span>
                )}
              </div>
              <div className="w-[90px] text-right py-2">
                <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                  {formatCurrency(row.unitPrice)}
                </span>
              </div>
              <div className="w-[90px] text-right py-2">
                <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                  {formatCurrency(row.total)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Custom Lines */}
        {customLines.map((line) => (
          <CustomLineRow
            key={line.id}
            line={line}
            onRemove={onRemoveCustomLine ? () => onRemoveCustomLine(line.id) : undefined}
          />
        ))}

        {/* Add Line Button or Form */}
        {showAddButton && !isAddingLine && (
          <button
            onClick={() => setIsAddingLine(true)}
            className="w-full flex items-center gap-2 px-3 py-3 text-sm font-medium text-hw-brand hover:bg-hw-surface-subtle transition-colors border-t border-hw-border"
          >
            <Plus className="h-4 w-4" />
            Add line
          </button>
        )}
        {isAddingLine && <AddLineForm />}
      </div>
    );
  }

  // PARTIAL VIEW (default) - One row per job
  return (
    <div className="flex flex-col overflow-hidden rounded-lg">
      {/* Table Header */}
      <div className="flex items-center gap-5 h-10 border-b border-hw-border">
        <div className="flex-1 py-2">
          <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
            Name
          </span>
        </div>
        <div className="w-[100px]" />
        <div className="w-[100px] text-right py-2">
          <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
            Unit price
          </span>
        </div>
        <div className="w-[100px] text-right py-2">
          <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
            Total
          </span>
        </div>
      </div>

      {/* Partial Rows - One per job */}
      {partialRows.map((row) => {
        const jobData = jobs.find(j => j.id === row.id);
        const hasCustomFinance = jobData?.finance && !jobData.finance.inherited;
        
        return (
          <div
            key={row.id}
            className="flex items-center gap-5 min-h-[40px] max-h-[56px]"
          >
            <div className="flex-1 flex items-center gap-2.5 py-2">
              <JobTypeDot category={getCategoryColor(row.categoryIndex)} />
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                {row.jobRef}
              </span>
              {/* Show override indicator if job has custom finance */}
              {hasCustomFinance && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Custom finance
                </span>
              )}
            </div>
            <div className="w-[100px]" />
            <div className="w-[100px] text-right py-2">
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                {formatCurrency(row.unitPrice)}
              </span>
            </div>
            <div className="w-[100px] text-right py-2">
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                {formatCurrency(row.total)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Custom Lines */}
      {customLines.map((line) => (
        <CustomLineRow
          key={line.id}
          line={line}
          onRemove={onRemoveCustomLine ? () => onRemoveCustomLine(line.id) : undefined}
        />
      ))}

      {/* Add Line Button or Form */}
      {showAddButton && !isAddingLine && (
        <button
          onClick={() => setIsAddingLine(true)}
          className="w-full flex items-center gap-2 px-3 py-3 text-sm font-medium text-hw-brand hover:bg-hw-surface-subtle transition-colors border-t border-hw-border"
        >
          <Plus className="h-4 w-4" />
          Add line
        </button>
      )}
      {isAddingLine && <AddLineForm />}
    </div>
  );
}

// Attachment item
function AttachmentItem({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: () => void;
}) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-hw-surface-subtle rounded-md group">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-4 w-4 text-hw-text-secondary shrink-0" />
        <span className="text-sm text-hw-text truncate">{attachment.name}</span>
        <span className="text-xs text-hw-text-secondary shrink-0">
          ({formatFileSize(attachment.size)})
        </span>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-hw-surface-hover rounded transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="h-4 w-4 text-hw-text-secondary" />
      </button>
    </div>
  );
}

export function LiveInvoicePreview({
  invoice,
  onUpdateInvoice,
  universalSettings,
  onSendInvoice,
  isSent,
}: LiveInvoicePreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editJobsModalOpen, setEditJobsModalOpen] = useState(false);
  const [perInvoiceSettingsOpen, setPerInvoiceSettingsOpen] = useState(false);
  const showPerInvoiceSettings = useFeatureFlag("showPerInvoiceSettings", false);

  // Handle saving changes from the Edit Jobs modal
  const handleEditJobsSave = (
    selectedJobIds: Set<string>,
    levelOfDetail: LevelOfDetail,
    updatedJobs?: JobWithLines[]
  ) => {
    onUpdateInvoice({
      selectedJobIds,
      levelOfDetail,
      isOverridden: true,
      ...(updatedJobs && { jobs: updatedJobs }),
    });
  };

  // Calculate totals
  const { subtotal, vatAmount, total, selectedJobCount } = useMemo(() => {
    let sub = 0;
    let jobCount = 0;

    invoice.jobs.forEach((job) => {
      if (job.isGroupJob && job.childJobs) {
        job.childJobs.forEach((child) => {
          if (invoice.selectedJobIds.has(child.id)) {
            sub += child.leftToInvoice;
            jobCount++;
          }
        });
        if (invoice.selectedGroupLines.has(job.id)) {
          sub += job.leftToInvoice;
        }
      } else {
        if (invoice.selectedJobIds.has(job.id)) {
          sub += job.leftToInvoice;
          jobCount++;
        }
      }
    });

    const vatRate = 0.2;
    const vat = sub * vatRate;

    return {
      subtotal: sub,
      vatAmount: vat,
      total: sub + vat,
      selectedJobCount: jobCount,
    };
  }, [invoice.jobs, invoice.selectedJobIds, invoice.selectedGroupLines]);

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    onUpdateInvoice({
      attachments: [...invoice.attachments, ...newAttachments],
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    onUpdateInvoice({
      attachments: invoice.attachments.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-6 flex flex-col items-center gap-4 text-hw-surface-subtle">
        {/* Sent Invoice Banner */}
        {isSent && (
          <div className="w-full max-w-[900px] flex items-start gap-2 p-3 bg-green-50 rounded-md border border-green-200">
            <Info className="w-5 h-5 text-green-700 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-hw-text leading-5 tracking-[-0.14px]">
                Invoice sent
              </p>
              <p className="text-sm text-hw-text leading-5 tracking-[-0.14px]">
                This invoice was sent to the customer on {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'x date'}
              </p>
            </div>
          </div>
        )}

        {/* Header Row - Title and Quick Actions */}
        <div className="w-full max-w-[900px] flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Building2 className="h-4 w-4 text-hw-text-secondary" />
            <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px]">
              {invoice.name} ({selectedJobCount} {selectedJobCount === 1 ? "Job" : "Jobs"}) - {formatCurrency(total)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Per-invoice Settings button - only shown when flag is enabled */}
            {showPerInvoiceSettings && (
              <Popover open={perInvoiceSettingsOpen} onOpenChange={setPerInvoiceSettingsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-4" align="end">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-medium text-hw-text">Invoice Settings</h4>
                      <p className="text-xs text-hw-text-secondary">Settings for this invoice only</p>
                    </div>
                    
                    {/* Level of Detail */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-hw-text-secondary">Level of detail</span>
                      <div className="flex gap-2">
                        {(["summary", "partial", "detailed"] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => {
                              onUpdateInvoice({ levelOfDetail: level, isOverridden: true });
                            }}
                            className={cn(
                              "flex-1 px-2 py-1.5 text-xs font-medium rounded-md border transition-colors capitalize",
                              invoice.levelOfDetail === level
                                ? "bg-hw-brand/10 border-hw-brand text-hw-brand"
                                : "bg-hw-surface border-hw-border text-hw-text hover:bg-hw-surface-subtle"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-hw-border" />

                    {/* Reset button */}
                    {invoice.isOverridden && (
                      <button
                        onClick={() => {
                          onUpdateInvoice({ 
                            levelOfDetail: universalSettings.levelOfDetail,
                            isOverridden: false 
                          });
                          setPerInvoiceSettingsOpen(false);
                        }}
                        className="text-xs text-hw-text-secondary hover:text-hw-text transition-colors text-left"
                      >
                        Reset to group settings
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1">
                  <ChevronDown className="h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Eye className="h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Download className="h-4 w-4" />
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <ExternalLink className="h-4 w-4" />
                  Open as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Printer className="h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Send Invoice split button - hidden when invoice is sent */}
            {!isSent && (
              <div className="flex items-stretch rounded-button shadow-[0_0_0_1px_rgba(7,98,229,0.8)] overflow-hidden">
                <Button
                  onClick={onSendInvoice}
                  size="sm"
                  className="rounded-r-none"
                >
                  Send invoice
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="rounded-l-none border-l border-white/20 px-1"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onSendInvoice} className="gap-2 cursor-pointer">
                      <Send className="h-4 w-4" />
                      Send invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <CheckCircle className="h-4 w-4" />
                      Mark as sent
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
                      <Trash2 className="h-4 w-4" />
                      Delete invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Document */}
        <div className="w-full max-w-[900px] bg-white rounded-modal border border-hw-border shadow-modal">
          <div className="p-10 flex flex-col gap-6">
            {/* Draft Badge */}
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E6F3FA] border border-[rgba(2,136,209,0.2)] w-fit">
              <span className="text-xs font-medium text-hw-text tracking-[-0.12px]">Draft</span>
            </div>

            {/* Top Section - Logo/Company and Dates */}
            <div className="flex items-start justify-between">
              {/* Left side - Logo and Company name */}
              <div className="flex flex-col gap-4">
                {/* Logo Section - only visible when enabled in settings */}
                {invoice.showLogo && (
                  <LogoUploader
                    logo={invoice.logo}
                    onLogoChange={(logo) => onUpdateInvoice({ logo })}
                  />
                )}
                {/* Company name */}
                <span className="text-xl font-bold text-hw-text">
                  BigChange Ltd
                </span>
              </div>

              {/* Right side - Dates and References - Editable */}
              <div className="flex flex-col gap-4">
                {/* First row: Issue date & Due date */}
                <div className="flex gap-6 justify-end items-start">
                  <div className="flex flex-col gap-1 text-right w-[98px]">
                    <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
                      Issue date:
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "text-sm tracking-[-0.14px] leading-5 hover:underline cursor-pointer text-right",
                            invoice.issueDate ? "text-hw-text" : "text-hw-text-secondary/40"
                          )}
                        >
                          {invoice.issueDate ? format(new Date(invoice.issueDate), "dd/MM/yyyy") : "DD/MM/YYYY"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="end" sideOffset={4}>
                        <Calendar
                          mode="single"
                          selected={invoice.issueDate ? new Date(invoice.issueDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              onUpdateInvoice({ issueDate: format(date, "yyyy-MM-dd") });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-1 text-right w-[91px]">
                    <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
                      Due date:
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "text-sm tracking-[-0.14px] leading-5 hover:underline cursor-pointer text-right",
                            invoice.dueDate ? "text-hw-text" : "text-hw-text-secondary/40"
                          )}
                        >
                          {invoice.dueDate ? format(new Date(invoice.dueDate), "dd/MM/yyyy") : "DD/MM/YYYY"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="end" sideOffset={4}>
                        <Calendar
                          mode="single"
                          selected={invoice.dueDate ? new Date(invoice.dueDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              onUpdateInvoice({ dueDate: format(date, "yyyy-MM-dd") });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {/* Second row: Invoice Number & Reference - Editable */}
                <div className="flex gap-6 justify-end items-start">
                  <div className="flex flex-col gap-1 text-right w-[128px]">
                    <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
                      Invoice Number:
                    </span>
                    <input
                      type="text"
                      value={`${invoice.invoiceNumberPrefix || "IV"}/${invoice.invoiceNumber.toString().padStart(5, "0")}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const match = value.match(/^([A-Za-z]+)\/(\d+)$/);
                        if (match) {
                          onUpdateInvoice({
                            invoiceNumberPrefix: match[1].toUpperCase(),
                            invoiceNumber: parseInt(match[2], 10) || invoice.invoiceNumber,
                          } as Partial<InvoiceData>);
                        }
                      }}
                      className="text-sm text-hw-text tracking-[-0.14px] leading-5 text-right bg-transparent border-none outline-none hover:underline focus:underline"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-right w-[66px]">
                    <span className="text-xs font-medium text-hw-text-secondary tracking-[-0.12px] leading-4">
                      Reference:
                    </span>
                    <input
                      type="text"
                      value={invoice.reference || ""}
                      onChange={(e) => onUpdateInvoice({ reference: e.target.value })}
                      placeholder="243452"
                      className="text-sm text-hw-text tracking-[-0.14px] leading-5 text-right bg-transparent border-none outline-none hover:underline focus:underline placeholder:text-hw-text-secondary/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="bg-[#F3F5F9] rounded-lg px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">
                  BILL TO
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-hw-text leading-6">
                    {invoice.name}
                  </span>
                  <span className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px]">
                    {invoice.address}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-hw-brand hover:underline transition-colors"
              >
                Edit contact
              </button>
            </div>

            {/* Invoice Title - Editable */}
            <div className="flex flex-col gap-1.5">
              <span className="text-base font-medium text-hw-text-secondary tracking-[-0.14px]">
                Invoice title
              </span>
              <div className="w-[190px] px-2.5 py-1.5 bg-white shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] rounded-md">
                <input
                  type="text"
                  value={invoice.title || ""}
                  onChange={(e) => onUpdateInvoice({ title: e.target.value })}
                  placeholder="Fire extinguisher service"
                  className="text-sm font-medium text-hw-text tracking-[-0.14px] bg-transparent border-none outline-none w-full placeholder:text-hw-text-secondary"
                />
              </div>
            </div>

            {/* Jobs Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-hw-text-secondary tracking-[-0.16px] leading-6">
                  Jobs
                </span>
                <button
                  onClick={() => setEditJobsModalOpen(true)}
                  className="text-sm font-medium text-hw-brand hover:underline transition-colors"
                >
                  Edit jobs
                </button>
              </div>
              <JobsTable
                jobs={invoice.jobs}
                selectedJobIds={invoice.selectedJobIds}
                levelOfDetail={invoice.levelOfDetail}
                customLines={invoice.customLines}
                onAddCustomLine={(line) => {
                  onUpdateInvoice({
                    customLines: [...invoice.customLines, line],
                  });
                }}
                onRemoveCustomLine={(lineId) => {
                  onUpdateInvoice({
                    customLines: invoice.customLines.filter((l) => l.id !== lineId),
                  });
                }}
                showAddButton={invoice.customLine}
              />
            </div>

            {/* Notes and Totals Row - Side by Side */}
            <div className="flex flex-wrap gap-6 items-start">
              {/* Left: Notes and Upload */}
              <div className="flex flex-col gap-6 flex-1 min-w-[200px]">
                {/* Notes Section */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                    Notes
                  </label>
                  <Textarea
                    value={invoice.notes}
                    onChange={(e) => onUpdateInvoice({ notes: e.target.value })}
                    placeholder=""
                    className="min-h-[66px] resize-y shadow-input border-none"
                  />
                </div>

                {/* Upload Attachments Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    Upload attachments
                  </Button>
                </div>

                {/* Attachments List */}
                {invoice.attachments.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {invoice.attachments.map((attachment) => (
                      <AttachmentItem
                        key={attachment.id}
                        attachment={attachment}
                        onRemove={() => removeAttachment(attachment.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Totals Section */}
              <div className="flex flex-col flex-1 min-w-[220px] max-w-[400px] rounded-card overflow-hidden">
                {/* Breakdown rows */}
                <div className="flex flex-col gap-3 pt-3 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                      Subtotal
                    </span>
                    <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                      VAT (Rate)
                    </span>
                    <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                      {formatCurrency(vatAmount)}
                    </span>
                  </div>
                </div>

                {/* Amount due row */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    Amount due
                  </span>
                  <span className="text-xl font-bold text-hw-text tracking-[-0.2px] leading-6">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section - only visible when enabled in settings */}
            {invoice.showTcs && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  Terms & Conditions
                </label>
                <div className="p-4 bg-hw-surface-subtle rounded-card">
                  <p className="text-xs text-hw-text-secondary tracking-[-0.12px] leading-4">
                    Payment is due within 30 days of the invoice date. Late payments may be subject to interest charges at the rate of 2% per month. All goods remain the property of the seller until payment is received in full. Any disputes must be raised within 14 days of receipt of this invoice.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Jobs Modal */}
      <EditJobsModal
        open={editJobsModalOpen}
        onOpenChange={setEditJobsModalOpen}
        jobs={invoice.jobs}
        selectedJobIds={invoice.selectedJobIds}
        levelOfDetail={invoice.levelOfDetail}
        defaultFinance={invoice.defaultFinance}
        onSave={handleEditJobsSave}
        onChange={handleEditJobsSave}
      />
    </div>
  );
}
