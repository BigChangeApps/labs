import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Paperclip, FileText, Search, ChevronDown, ChevronLeft, ChevronRight, Check, MoreVertical, Building2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Calendar } from "@/registry/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { formatCurrency } from "../lib/mock-data";
import { markJobsAsInvoiced } from "../lib/invoice-utils";
import { cn } from "@/registry/lib/utils";
import {
  initializeInvoiceSelection,
  getInvoiceSelection,
  toggleLineItem,
  toggleJob,
  getLineCounts,
  calculateTotals as calculateTotalsFromState,
  setViewMode,
  type LineItem as StateLineItem,
} from "../lib/invoice-state";
import { Checkbox } from "@/registry/ui/checkbox";

// Types
interface JobWithLines {
  id: string;
  jobRef: string;
  completed: string;
  linesCount: number;
  selectedLinesCount: number;
  leftToInvoice: number;
  jobCategory: string;
  isGroupJob: boolean;
  childJobs?: JobWithLines[];
  site?: string;
  engineerName?: string;
  jobStartDate?: string;
  time?: string;
  resource?: string;
  vehicle?: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

type LevelOfDetail = "summary" | "partial" | "detailed";

interface InvoiceData {
  id: string;
  invoiceNumber: number;
  name: string;
  address: string;
  jobs: JobWithLines[];
  originalJobIds?: string[]; // Track original job IDs from mockJobs
  title: string;
  reference: string;
  issueDate: string;
  dueDate: string;
  bankAccount: string;
  currency: string;
  notes: string;
  attachments: Attachment[];
  levelOfDetail?: LevelOfDetail; // Level of detail for invoice rendering
  selectedJobIds?: Set<string> | string[]; // Selected job IDs for partial view
  selectedGroupLines?: Set<string> | string[]; // Selected group line IDs
  selectedLineDetailFields?: string[]; // Selected line detail fields to display
}

// Line detail field definitions
interface LineDetailField {
  key: string;
  label: string;
  getValue: (job: JobWithLines) => string | undefined;
}

const LINE_DETAIL_FIELDS: LineDetailField[] = [
  {
    key: "name",
    label: "Name",
    getValue: (job) => job.engineerName,
  },
  {
    key: "jobSite",
    label: "Job Site",
    getValue: (job) => job.site,
  },
  {
    key: "jobStartDate",
    label: "Job Start Date",
    getValue: (job) => job.jobStartDate,
  },
  {
    key: "time",
    label: "Time",
    getValue: (job) => job.time,
  },
  {
    key: "resource",
    label: "Resource",
    getValue: (job) => job.resource,
  },
  {
    key: "vehicle",
    label: "Vehicle",
    getValue: (job) => job.vehicle,
  },
];

// Mock line items for the preview
interface LineItem {
  id: string;
  jobRef: string;
  jobDate: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Generate mock line items from jobs
function generateLineItems(jobs: JobWithLines[]): LineItem[] {
  const items: LineItem[] = [];
  const descriptions = [
    "Fire Extinguisher Inspection",
    "Fire Alarm Maintenance",
    "Emergency Lighting Test",
    "Sprinkler System Check",
    "Exit Sign Maintenance",
    "Hose Reel Service",
    "Fire Door Inspection",
    "Portable Appliance Testing",
    "Kitchen Suppression System Service",
    "Safety Equipment Training",
  ];

  jobs.forEach((job) => {
    const numLines = Math.min(job.linesCount, 4);
    for (let i = 0; i < numLines; i++) {
      const quantity = Math.floor(Math.random() * 4) + 1;
      const unitPrice = Math.floor(Math.random() * 150) + 30;
      items.push({
        id: `${job.id}-line-${i}`,
        jobRef: job.jobRef,
        jobDate: job.completed,
        description: descriptions[i % descriptions.length],
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      });
    }
  });

  return items;
}

// Format date for display
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return isToday ? `${formatted} (Today)` : formatted;
}

// Resource avatar component
function ResourceAvatar({ initials = "LB" }: { initials?: string }) {
  return (
    <div className="relative size-[18px]">
      <div className="absolute inset-0 rounded-full bg-white shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.45px_1.8px_0px_rgba(11,38,66,0.16)] overflow-hidden">
        <div className="absolute inset-[5%] rounded-full bg-[#F8F9FC] flex items-center justify-center">
          <span className="text-[8px] font-semibold text-[#73777D] leading-none">{initials}</span>
        </div>
      </div>
    </div>
  );
}

// Lines selection badge
function LinesBadge({ 
  total, 
  selected, 
  isPartial = false,
  isInactive = false,
}: { 
  total: number; 
  selected?: number; 
  isPartial?: boolean;
  isInactive?: boolean;
}) {
  if (isPartial && selected !== undefined) {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(8,109,255,0.08)] border border-hw-brand/20 w-fit">
        <span className="text-sm font-medium text-[#0288d1] tracking-[-0.14px]">{selected} of {total} lines</span>
      </div>
    );
  }
  if (isInactive) {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(26,28,46,0.05)] border border-hw-border w-fit">
        <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{total} lines</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white border border-hw-border w-fit">
      <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{total} lines</span>
    </div>
  );
}

// Job type badge
function JobTypeBadge({ type }: { type: string }) {
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white border border-hw-border">
      <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{type}</span>
    </div>
  );
}

// Stacked layers icon for group jobs
function StacksIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2.5L2.5 6.25L10 10L17.5 6.25L10 2.5Z" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 13.75L10 17.5L17.5 13.75" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 10L10 13.75L17.5 10" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Single job card
function JobCard({ 
  job, 
  showPartial = false,
  selectedLineDetailFields = [],
}: { 
  job: JobWithLines; 
  showPartial?: boolean;
  selectedLineDetailFields?: string[];
}) {
  const isPartial = showPartial && job.selectedLinesCount > 0 && job.selectedLinesCount < job.linesCount;
  
  // Get field values for selected fields
  const fieldValues = useMemo(() => {
    return selectedLineDetailFields
      .map((fieldKey) => {
        const field = LINE_DETAIL_FIELDS.find((f) => f.key === fieldKey);
        if (!field) return null;
        const value = field.getValue(job);
        if (!value) return null;
        return { label: field.label, value };
      })
      .filter((item): item is { label: string; value: string } => item !== null);
  }, [job, selectedLineDetailFields]);
  
  return (
    <div className="bg-white rounded-lg border border-hw-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
            <ResourceAvatar initials={job.jobCategory === "Internal" ? "CS" : "LB"} />
          </div>
          {fieldValues.length > 0 && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              {fieldValues.map(({ label, value }) => (
                <span key={label} className="text-xs text-[#73777D] tracking-[-0.14px]">
                  {label}: {value}
                </span>
              ))}
            </div>
          )}
          <LinesBadge 
            total={job.linesCount} 
            selected={isPartial ? job.selectedLinesCount : undefined}
            isPartial={isPartial}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(job.leftToInvoice)}</span>
        </div>
      </div>
    </div>
  );
}

// Nested job card (read-only for preview)
function NestedJobCardPreview({ 
  job,
  selectedLineDetailFields = [],
}: { 
  job: JobWithLines;
  selectedLineDetailFields?: string[];
}) {
  const isPartial = job.selectedLinesCount > 0 && job.selectedLinesCount < job.linesCount;
  
  // Get field values for selected fields
  const fieldValues = useMemo(() => {
    return selectedLineDetailFields
      .map((fieldKey) => {
        const field = LINE_DETAIL_FIELDS.find((f) => f.key === fieldKey);
        if (!field) return null;
        const value = field.getValue(job);
        if (!value) return null;
        return { label: field.label, value };
      })
      .filter((item): item is { label: string; value: string } => item !== null);
  }, [job, selectedLineDetailFields]);
  
  return (
    <div className="bg-white rounded-lg border border-hw-border overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
            <ResourceAvatar initials={job.jobCategory === "Internal" ? "CS" : "LB"} />
          </div>
          {fieldValues.length > 0 && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              {fieldValues.map(({ label, value }) => (
                <span key={label} className="text-xs text-[#73777D] tracking-[-0.14px]">
                  {label}: {value}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <LinesBadge 
              total={job.linesCount} 
              selected={isPartial ? job.selectedLinesCount : undefined}
              isPartial={isPartial}
            />
            <JobTypeBadge type={job.jobCategory} />
          </div>
        </div>
        <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">
          {formatCurrency(job.leftToInvoice)}
        </span>
      </div>
    </div>
  );
}

// Summary view - single condensed line
function SummaryJobView({ 
  jobs, 
  totalValue,
  invoiceId,
}: { 
  jobs: JobWithLines[]; 
  totalValue: number;
  invoiceId: string;
}) {
  // Calculate total and included lines from state
  let totalLines = 0;
  let includedLines = 0;
  
  jobs.forEach((job) => {
    if (job.isGroupJob && job.childJobs) {
      job.childJobs.forEach((child) => {
        const counts = getLineCounts(invoiceId, child.id);
        totalLines += counts.total;
        includedLines += counts.included;
      });
    } else {
      const counts = getLineCounts(invoiceId, job.id);
      totalLines += counts.total;
      includedLines += counts.included;
    }
  });

  const firstJob = jobs[0];
  
  return (
    <div className="space-y-4">
      {/* Service heading */}
      <h3 className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">
        Fire Extinguisher Servicing
      </h3>
      
      {/* Job card */}
      <div className="bg-white rounded-lg border border-hw-border overflow-hidden">
        <div className="flex items-center justify-between pl-4 pr-3 py-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{firstJob?.jobRef || "INT/12345"}</span>
              <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{firstJob?.completed || "Wed 21 May 2025"}</span>
              <ResourceAvatar initials={firstJob?.jobCategory === "Internal" ? "CS" : "LB"} />
            </div>
            <div className="inline-flex items-center px-1.5 py-px h-5 rounded-md bg-[rgba(8,109,255,0.08)] border border-hw-brand/20 w-fit">
              <span className="text-sm font-medium tracking-[-0.14px] text-[#0288D1]">
                {includedLines} of {totalLines} lines
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category dot indicator for detailed view
function CategoryDot({ category }: { category: "blue" | "orange" | "purple" }) {
  const colors = {
    blue: "bg-[#086DFF]",
    orange: "bg-[#F59E0B]",
    purple: "bg-[#8B5CF6]",
  };
  return <div className={cn("w-2 h-2 rounded-full", colors[category])} />;
}

// Detailed view - table with line items (interactive for preview)
function DetailedJobView({ 
  lineItems,
  invoiceId,
  onLineItemToggle,
}: { 
  lineItems: LineItem[];
  invoiceId: string;
  onLineItemToggle?: (jobId: string, lineId: string) => void;
}) {
  // Get state line items to check selection status
  const state = getInvoiceSelection(invoiceId);
  
  return (
    <div className="border border-hw-border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-hw-border">
        <span className="w-10"></span>
        <span className="flex-1 text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Description</span>
        <span className="w-16 text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-center">Qty</span>
        <span className="w-24 text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">Unit price</span>
        <span className="w-24 text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">Total</span>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-[rgba(26,28,46,0.08)]">
        {lineItems.map((item) => {
          // Determine category color based on item index
          const categoryIndex = parseInt(item.id.split('-').pop() || '0') % 3;
          const category = categoryIndex === 0 ? "blue" : categoryIndex === 1 ? "orange" : "purple";
          
          // Extract jobId from line item id (format: jobId-line-X)
          const jobId = item.id.split('-line-')[0];
          const stateLineItem = state?.jobSelections.get(jobId)?.lineItems.find(l => l.id === item.id);
          const isSelected = stateLineItem?.selected ?? true;
          
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#F8F9FC] transition-colors">
              {onLineItemToggle && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onLineItemToggle(jobId, item.id)}
                />
              )}
              <div className="flex-1 flex items-center gap-2">
                <CategoryDot category={category} />
                <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">{item.description}</span>
              </div>
              <span className="w-16 text-sm font-normal text-[#0B2642] tracking-[-0.14px] text-center">{item.quantity.toFixed(1)}</span>
              <span className="w-24 text-sm font-normal text-[#0B2642] tracking-[-0.14px] text-right">{formatCurrency(item.unitPrice)}</span>
              <span className="w-24 text-sm font-normal text-[#0B2642] tracking-[-0.14px] text-right">{formatCurrency(item.total)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Group job card (read-only for preview)
function GroupJobCardPreview({ 
  groupJob,
  childJobs,
  selectedJobIds,
  selectedGroupLines,
  showPartial = false,
  selectedLineDetailFields = [],
}: { 
  groupJob: JobWithLines;
  childJobs: JobWithLines[];
  selectedJobIds?: Set<string> | string[];
  selectedGroupLines?: Set<string> | string[];
  showPartial?: boolean;
  selectedLineDetailFields?: string[];
}) {
  const groupLinesValue = 1000;
  
  // Convert arrays to Sets if needed
  const selectedJobIdsSet = selectedJobIds instanceof Set 
    ? selectedJobIds 
    : selectedJobIds ? new Set(selectedJobIds) : new Set<string>();
  const selectedGroupLinesSet = selectedGroupLines instanceof Set 
    ? selectedGroupLines 
    : selectedGroupLines ? new Set(selectedGroupLines) : new Set<string>();
  
  const groupLinesSelected = selectedGroupLinesSet.has(groupJob.id);
  
  // Calculate value based on selections if partial view
  const childJobsValue = showPartial
    ? childJobs.reduce((sum, job) => 
        selectedJobIdsSet.has(job.id) ? sum + job.leftToInvoice : sum, 0
      )
    : childJobs.reduce((sum, job) => sum + job.leftToInvoice, 0);
  
  const totalValue = childJobsValue + (groupLinesSelected ? groupLinesValue : (showPartial ? 0 : groupLinesValue));

  // Get field values for selected fields on group job
  const groupFieldValues = useMemo(() => {
    return selectedLineDetailFields
      .map((fieldKey) => {
        const field = LINE_DETAIL_FIELDS.find((f) => f.key === fieldKey);
        if (!field) return null;
        const value = field.getValue(groupJob);
        if (!value) return null;
        return { label: field.label, value };
      })
      .filter((item): item is { label: string; value: string } => item !== null);
  }, [groupJob, selectedLineDetailFields]);

  return (
    <div className="bg-white rounded-lg border border-hw-border overflow-hidden">
      <div className="bg-[#F8F9FC] border-b border-hw-border px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              <StacksIcon />
              <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{groupJob.jobRef}</span>
              <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">21 May - 3 June 2025</span>
            </div>
            {groupFieldValues.length > 0 && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {groupFieldValues.map(({ label, value }) => (
                  <span key={label} className="text-xs text-[#73777D] tracking-[-0.14px]">
                    {label}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Group-level lines */}
        {(groupLinesSelected || !showPartial) && (
          <div className="bg-white rounded-lg border border-hw-border overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 flex flex-col gap-1.5">
                <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">Group-level lines</span>
                <LinesBadge total={10} />
              </div>
              <span className={cn(
                "text-sm font-bold tracking-[-0.14px]",
                groupLinesSelected || !showPartial ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)] line-through"
              )}>
                {formatCurrency(groupLinesValue)}
              </span>
            </div>
          </div>
        )}
        
        {childJobs.map((childJob) => {
          const isSelected = showPartial ? selectedJobIdsSet.has(childJob.id) : true;
          if (showPartial && !isSelected) return null;
          
          return (
            <NestedJobCardPreview
              key={childJob.id}
              job={childJob}
              selectedLineDetailFields={selectedLineDetailFields}
            />
          );
        })}
      </div>
    </div>
  );
}

// Attachment Uploader Component
function AttachmentUploader({
  attachments,
  onAttachmentsChange,
}: {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    onAttachmentsChange([...attachments, ...newAttachments]);
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (id: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
      />

      {/* Uploaded files list */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between px-3 py-2 bg-[#F8F9FC] rounded-md"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-[#73777D] shrink-0" />
                <span className="text-sm text-[#0B2642] truncate">
                  {attachment.name}
                </span>
                <span className="text-xs text-[#73777D] shrink-0">
                  ({formatFileSize(attachment.size)})
                </span>
              </div>
              <button
                onClick={() => handleRemove(attachment.id)}
                className="p-1 hover:bg-[rgba(11,38,66,0.08)] rounded transition-colors shrink-0"
              >
                <X className="h-4 w-4 text-[#73777D]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <Button
        variant="secondary"
        size="sm"
        className="gap-1.5"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="h-4 w-4" />
        Upload attachments
      </Button>
    </div>
  );
}

// Date Picker Component
function DatePicker({
  label,
  date,
  onDateChange,
}: {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-between w-full h-8 px-2 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors text-left",
              !date && "text-[rgba(11,38,66,0.4)]"
            )}
          >
            <span className={cn(
              "text-sm tracking-[-0.14px]",
              date ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)]"
            )}>
              {date ? format(date, "dd/MM/yyyy") : "DD/MM/YYYY"}
            </span>
            <CalendarIcon className="h-5 w-5 text-[#0B2642]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              onDateChange(newDate);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Line Detail Field Autocomplete Component
function LineDetailFieldAutocomplete({
  selectedFields,
  onFieldsChange,
}: {
  selectedFields: string[];
  onFieldsChange: (fields: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const availableFields = LINE_DETAIL_FIELDS.filter(
    (field) => !selectedFields.includes(field.key)
  );

  const filteredFields = useMemo(() => {
    if (!searchValue) return availableFields;
    const lowerSearch = searchValue.toLowerCase();
    return availableFields.filter((field) =>
      field.label.toLowerCase().includes(lowerSearch)
    );
  }, [availableFields, searchValue]);

  const handleSelect = (fieldKey: string) => {
    if (!selectedFields.includes(fieldKey)) {
      onFieldsChange([...selectedFields, fieldKey]);
    }
    setSearchValue("");
    setOpen(false);
    // Reset input focus after selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (!open && value) {
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredFields.length > 0) {
      // Select the first filtered field on Enter
      handleSelect(filteredFields[0].key);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setOpen(false);
      setSearchValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#73777D] pointer-events-none z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Add field..."
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            className="pl-8 pr-8 h-9 cursor-text"
            onClick={(e) => {
              e.stopPropagation();
              if (!open) setOpen(true);
            }}
          />
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#73777D] pointer-events-none z-10" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search fields..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No fields found.</CommandEmpty>
            <CommandGroup>
              {filteredFields.map((field) => (
                <CommandItem
                  key={field.key}
                  value={field.key}
                  onSelect={() => handleSelect(field.key)}
                >
                  {field.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function InvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get invoice data from navigation state
  const locationState = (location.state || {}) as {
    invoiceData?: InvoiceData; // Legacy support
    allInvoices?: InvoiceData[]; // New: all invoices
    totalInvoiceCount?: number;
    currentInvoiceIndex?: number;
  };

  // Default invoice data for testing
  const defaultInvoiceData: InvoiceData = {
    id: "invoice-1",
    invoiceNumber: 1,
    name: "Boots",
    address: "Boots Pharmacy, Leeds, Victoria Gate, Harewood St, Leeds LS2 7AR",
    jobs: [
      {
        id: "job-1",
        jobRef: "381920 - Boots Pharmacy",
        completed: "Mon, 10 Nov 2025",
        linesCount: 10,
        selectedLinesCount: 10,
        leftToInvoice: 1250,
        jobCategory: "External",
        isGroupJob: false,
      },
      {
        id: "job-2",
        jobRef: "381923 - Tesco Express",
        completed: "Sun, 9 Nov 2025",
        linesCount: 8,
        selectedLinesCount: 8,
        leftToInvoice: 980,
        jobCategory: "External",
        isGroupJob: false,
      },
    ],
    title: "Fire Extinguisher Servicing",
    reference: "24105843",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    bankAccount: "barclays",
    currency: "gbp",
    notes: "",
    attachments: [],
    levelOfDetail: "partial",
  };

  // Determine if we have multiple invoices
  const hasMultipleInvoices = locationState.allInvoices && locationState.allInvoices.length > 1;
  const allInvoices = locationState.allInvoices || (locationState.invoiceData ? [locationState.invoiceData] : [defaultInvoiceData]);
  
  // Track current invoice index (0-based)
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState<number>(() => {
    if (locationState.currentInvoiceIndex !== undefined) {
      return Math.max(0, Math.min(locationState.currentInvoiceIndex, allInvoices.length - 1));
    }
    return 0;
  });

  // Track sent invoice IDs
  const [sentInvoiceIds, setSentInvoiceIds] = useState<Set<string>>(new Set());


  // Get current invoice from array (memoized to prevent unnecessary recalculations)
  const currentInvoice = useMemo(() => {
    return allInvoices[currentInvoiceIndex] || allInvoices[0] || defaultInvoiceData;
  }, [allInvoices, currentInvoiceIndex]);

  // Initialize invoice data state with current invoice
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => {
    const data = currentInvoice;
    // Ensure selectedLineDetailFields is initialized
    if (!data.selectedLineDetailFields) {
      return { ...data, selectedLineDetailFields: [] };
    }
    return data;
  });

  // Get level of detail, default to "partial" if not specified
  // (must be defined before the useEffect that uses it)
  const levelOfDetail: LevelOfDetail = invoiceData.levelOfDetail || "partial";

  // Initialize state management for invoice selections
  useEffect(() => {
    if (invoiceData.id) {
      // Convert jobs to line items format for state management
      const jobsWithLineItems = invoiceData.jobs.map((job) => {
        // Generate line items for this job
        const jobLineItems: StateLineItem[] = [];
        const categories: Array<"labour" | "materials" | "other"> = ["labour", "materials", "other"];
        
        for (let i = 0; i < job.linesCount; i++) {
          jobLineItems.push({
            id: `${job.id}-line-${i}`,
            jobId: job.id,
            category: categories[i % 3],
            description: `Line item ${i + 1}`,
            quantity: 1,
            unitPrice: job.leftToInvoice / job.linesCount,
            total: job.leftToInvoice / job.linesCount,
            selected: job.selectedLinesCount > i,
          });
        }
        
        return {
          id: job.id,
          lineItems: jobLineItems,
        };
      });

      // Initialize if not already initialized
      if (!getInvoiceSelection(invoiceData.id)) {
        initializeInvoiceSelection(
          invoiceData.id,
          jobsWithLineItems,
          levelOfDetail
        );
      }
    }
  }, [invoiceData.id, invoiceData.jobs, levelOfDetail]);

  // Update invoice data when current invoice changes
  useEffect(() => {
    const data = currentInvoice;
    if (!data.selectedLineDetailFields) {
      setInvoiceData({ ...data, selectedLineDetailFields: [] });
    } else {
      setInvoiceData(data);
    }
  }, [currentInvoice]);

  const totalInvoiceCount = allInvoices.length;

  // Line level detail fields
  const selectedLineDetailFields = invoiceData.selectedLineDetailFields || [];
  
  const handleLineDetailFieldsChange = (fields: string[]) => {
    setInvoiceData((prev) => ({ ...prev, selectedLineDetailFields: fields }));
  };

  const handleRemoveField = (fieldKey: string) => {
    handleLineDetailFieldsChange(selectedLineDetailFields.filter((f) => f !== fieldKey));
  };
  
  // Convert selection arrays to Sets if needed
  const selectedJobIdsSet = useMemo(() => {
    if (!invoiceData.selectedJobIds) return new Set<string>();
    return invoiceData.selectedJobIds instanceof Set 
      ? invoiceData.selectedJobIds 
      : new Set(invoiceData.selectedJobIds);
  }, [invoiceData.selectedJobIds]);
  
  const selectedGroupLinesSet = useMemo(() => {
    if (!invoiceData.selectedGroupLines) return new Set<string>();
    return invoiceData.selectedGroupLines instanceof Set 
      ? invoiceData.selectedGroupLines 
      : new Set(invoiceData.selectedGroupLines);
  }, [invoiceData.selectedGroupLines]);

  // Calculate the count of selected jobs
  const selectedJobsCount = useMemo(() => {
    let count = 0;
    invoiceData.jobs.forEach(job => {
      if (job.isGroupJob && job.childJobs) {
        // Count selected child jobs within group jobs
        job.childJobs.forEach(child => {
          if (selectedJobIdsSet.has(child.id)) {
            count++;
          }
        });
      } else {
        // Count selected regular jobs
        if (selectedJobIdsSet.has(job.id)) {
          count++;
        }
      }
    });
    return count;
  }, [invoiceData.jobs, selectedJobIdsSet]);

  // Calculate total value for summary view (all jobs)
  const totalValue = useMemo(() => {
    return invoiceData.jobs.reduce((sum, job) => {
      if (job.isGroupJob && job.childJobs) {
        return sum + job.childJobs.reduce((s, c) => s + c.leftToInvoice, 0) + 1000;
      }
      return sum + job.leftToInvoice;
    }, 0);
  }, [invoiceData.jobs]);

  // Calculate selected total value (only selected jobs)
  const selectedTotalValue = useMemo(() => {
    return invoiceData.jobs.reduce((sum, job) => {
      if (!selectedJobIdsSet.has(job.id)) return sum;
      if (job.isGroupJob && job.childJobs) {
        return sum + job.childJobs.reduce((s, c) => s + c.leftToInvoice, 0) + 1000;
      }
      return sum + job.leftToInvoice;
    }, 0);
  }, [invoiceData.jobs, selectedJobIdsSet]);

  // Generate line items for detailed view
  const lineItems = useMemo(() => generateLineItems(invoiceData.jobs), [invoiceData.jobs]);

  // Calculate totals based on level of detail and selections using state management
  const { subtotal, vatAmount, total } = useMemo(() => {
    // Try to use state management first
    const state = getInvoiceSelection(invoiceData.id);
    if (state) {
      return calculateTotalsFromState(invoiceData.id);
    }
    
    // Fallback to old calculation if state not initialized
    let sub = 0;
    
    if (levelOfDetail === "detailed") {
      // For detailed view, sum all line items
      lineItems.forEach(item => {
        sub += item.total;
      });
    } else if (levelOfDetail === "summary") {
      // For summary view, include all jobs
      invoiceData.jobs.forEach(job => {
        if (job.isGroupJob && job.childJobs) {
          job.childJobs.forEach(child => {
            sub += child.leftToInvoice;
          });
          sub += 1000; // Group lines value
        } else {
          sub += job.leftToInvoice;
        }
      });
    } else {
      // For partial view, sum based on selected jobs and group lines
      invoiceData.jobs.forEach(job => {
        if (job.isGroupJob && job.childJobs) {
          job.childJobs.forEach(child => {
            if (selectedJobIdsSet.has(child.id)) {
              sub += child.leftToInvoice;
            }
          });
          if (selectedGroupLinesSet.has(job.id)) {
            sub += 1000; // Group lines value
          }
        } else {
          sub += job.leftToInvoice;
        }
      });
    }
    
    const vatRate = 0.20;
    const vat = sub * vatRate;
    const total = sub + vat;
    return { subtotal: sub, vatAmount: vat, total };
  }, [invoiceData.id, invoiceData.jobs, levelOfDetail, selectedJobIdsSet, selectedGroupLinesSet, lineItems]);


  // Navigation functions
  const handleNext = () => {
    if (currentInvoiceIndex < allInvoices.length - 1) {
      setCurrentInvoiceIndex(currentInvoiceIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentInvoiceIndex > 0) {
      setCurrentInvoiceIndex(currentInvoiceIndex - 1);
    }
  };

  // Find next unsent invoice index
  const findNextUnsentInvoice = (startIndex: number): number => {
    for (let i = startIndex + 1; i < allInvoices.length; i++) {
      if (!sentInvoiceIds.has(allInvoices[i].id)) {
        return i;
      }
    }
    // If no unsent invoice found after startIndex, check from beginning
    for (let i = 0; i < startIndex; i++) {
      if (!sentInvoiceIds.has(allInvoices[i].id)) {
        return i;
      }
    }
    return -1; // All invoices sent
  };

  const handleSendInvoice = () => {
    // Mark current invoice as sent
    setSentInvoiceIds(prev => new Set([...prev, invoiceData.id]));
    
    // Mark jobs as invoiced if originalJobIds are available
    if (invoiceData.originalJobIds && invoiceData.originalJobIds.length > 0) {
      markJobsAsInvoiced(invoiceData.originalJobIds);
    }
    
    // If multiple invoices, auto-advance to next unsent invoice
    if (hasMultipleInvoices) {
      const nextIndex = findNextUnsentInvoice(currentInvoiceIndex);
      if (nextIndex !== -1) {
        setCurrentInvoiceIndex(nextIndex);
        return;
      }
      // All invoices sent - navigate back to jobs list
      navigate("/group-invoicing/v1", {
        state: {
          success: true,
          message: `Successfully sent ${allInvoices.length} invoice${allInvoices.length > 1 ? 's' : ''}`,
        },
      });
    } else {
      // Single invoice - navigate back to jobs list
      navigate("/group-invoicing/v1", {
        state: {
          success: true,
          message: `Successfully sent invoice for ${formatCurrency(total)}`,
        },
      });
    }
  };

  const updateInvoiceField = (field: keyof InvoiceData, value: string) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-screen bg-[#FCFCFD] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-hw-border shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#73777D]">Jobs ready to invoice</span>
          <ChevronRight className="h-4 w-4 text-[#73777D]" />
          <span className="font-medium text-[#0B2642]">Invoice/{invoiceData.invoiceNumber.toString().padStart(4, "0")}</span>
          <div className="ml-2 px-2 py-0.5 bg-white border border-hw-border rounded-full text-xs font-medium text-[#0B2642]">Draft</div>
          {sentInvoiceIds.has(invoiceData.id) && (
            <div className="ml-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(34,197,94,0.1)] border border-green-500/20">
              <Check className="h-3.5 w-3.5 text-[#22c55e]" />
              <span className="text-xs font-medium text-[#22c55e]">Sent</span>
            </div>
          )}
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => navigate("/group-invoicing/v1/create")}
        >
          Save as draft
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Form */}
        <div className="bg-white border-r border-hw-border overflow-auto">
          <div className="px-[46px] py-[32px] space-y-10 w-[780px]">
            {/* Header Row: Back link + Pagination */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate("/group-invoicing/v1/create")}
                className="flex items-center gap-1.5 text-sm font-medium text-[#73777D] hover:underline"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to create invoice
              </button>
              
              {/* Pagination */}
              {totalInvoiceCount > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentInvoiceIndex === 0}
                    className="p-1 rounded-md bg-white shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08)] hover:bg-[#F8F9FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous invoice"
                  >
                    <ChevronLeft className="h-6 w-6 text-[#0B2642]" />
                  </button>
                  <span className="text-base text-[#0B2642]">
                    <span className="font-medium">{currentInvoiceIndex + 1}</span>
                    <span className="text-[#73777D]"> of {totalInvoiceCount}</span>
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentInvoiceIndex === allInvoices.length - 1}
                    className="p-1 rounded-md bg-white shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08)] hover:bg-[#F8F9FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next invoice"
                  >
                    <ChevronRight className="h-6 w-6 text-[#0B2642]" />
                  </button>
                </div>
              )}
            </div>

            {/* Invoice title - editable */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Invoice title</label>
              <Input
                type="text"
                value={invoiceData.title}
                onChange={(e) => updateInvoiceField("title", e.target.value)}
                placeholder="Enter invoice title..."
                className="h-8 max-w-[302px]"
              />
            </div>

            {/* Form Section */}
            <div className="space-y-8">
              {/* Form grid - 2 columns with specific widths */}
              <div className="flex gap-[114px]">
                {/* Left column - 302px */}
                <div className="w-[302px] space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Invoice number</label>
                    <Input
                      type="text"
                      value={`HS/${invoiceData.invoiceNumber.toString().padStart(4, "0")}`}
                      className="h-8"
                      readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Contact</label>
                    <Input
                      type="text"
                      value={invoiceData.name}
                      className="h-8"
                      readOnly
                    />
                  </div>
                </div>

                {/* Right column - 240px */}
                <div className="w-[240px] space-y-4">
                  <DatePicker
                    label="Issue Date"
                    date={invoiceData.issueDate ? new Date(invoiceData.issueDate) : undefined}
                    onDateChange={(date) => {
                      if (date) {
                        updateInvoiceField("issueDate", format(date, "yyyy-MM-dd"));
                      }
                    }}
                  />
                  <DatePicker
                    label="Due Date"
                    date={invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined}
                    onDateChange={(date) => {
                      if (date) {
                        updateInvoiceField("dueDate", format(date, "yyyy-MM-dd"));
                      }
                    }}
                  />
                </div>
              </div>

              {/* Reference field */}
              <div className="w-[302px] space-y-1.5">
                <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Reference</label>
                <Input
                  type="text"
                  value={invoiceData.reference}
                  onChange={(e) => updateInvoiceField("reference", e.target.value)}
                  placeholder="Enter reference..."
                  className="h-8"
                />
              </div>

              <div className="border-t border-hw-border" />

              {/* Nominal and Department codes */}
              <div className="w-[302px] space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Nominal code</label>
                  <Input type="text" value="5001" className="h-8 text-[#73777D]" readOnly />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Department code</label>
                  <Input type="text" value="67800" className="h-8 text-[#73777D]" readOnly />
                </div>
              </div>

              <div className="border-t border-hw-border" />

              {/* Line Level Detail Section */}
              <div className="w-[302px] space-y-2">
                <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                  Line level detail
                </label>
                <div className="space-y-2">
                  {/* Autocomplete field selector */}
                  <LineDetailFieldAutocomplete
                    selectedFields={selectedLineDetailFields}
                    onFieldsChange={handleLineDetailFieldsChange}
                  />
                  
                  {/* Selected field tags */}
                  {selectedLineDetailFields.length > 0 && (
                    <div className="flex flex-wrap gap-[7px]">
                      {selectedLineDetailFields.map((fieldKey) => {
                        const field = LINE_DETAIL_FIELDS.find((f) => f.key === fieldKey);
                        if (!field) return null;
                        return (
                          <div
                            key={fieldKey}
                            className="inline-flex items-center gap-1 px-1 h-5 bg-[#F8F9FC] rounded-md"
                          >
                            <span className="text-xs text-[#73777D] tracking-[-0.12px]">{field.label}</span>
                            <button
                              onClick={() => handleRemoveField(fieldKey)}
                              className="hover:bg-[rgba(11,38,66,0.08)] rounded transition-colors"
                            >
                              <X className="h-3 w-3 text-[#0B2642]" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-hw-border" />

              {/* Notes Section */}
              <div className="w-[302px] space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Notes</label>
                  <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full h-[66px] px-2 py-2.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] resize-none text-sm text-[#0B2642] placeholder:text-[rgba(11,38,66,0.4)] focus:outline-none focus:ring-1 focus:ring-[#086DFF]"
                    placeholder="Add notes..."
                  />
                </div>
                
                {/* Attachments */}
                <AttachmentUploader
                  attachments={invoiceData.attachments}
                  onAttachmentsChange={(attachments) =>
                    setInvoiceData((prev) => ({ ...prev, attachments }))
                  }
                />
              </div>

              <div className="border-t border-hw-border" />

              {/* Site Title Header */}
              <div className="flex items-center gap-1">
                <Building2 className="h-6 w-6 text-[#73777D]" />
                <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px] leading-5">
                  {invoiceData.name} ({invoiceData.jobs.length}) – {formatCurrency(totalValue)}
                </span>
              </div>

              {/* Jobs Section */}
              <div className="flex flex-col gap-4">
                
                {/* Job Detail View Selector - horizontal cards */}
                <div className="flex gap-4 h-[91px]">
                  <button
                    onClick={() => {
                      setInvoiceData((prev) => ({ ...prev, levelOfDetail: "summary" }));
                      setViewMode(invoiceData.id, "summary");
                    }}
                    className={cn(
                      "flex-1 p-4 rounded-[10px] border text-left transition-colors flex gap-3 items-start",
                      levelOfDetail === "summary"
                        ? "bg-[rgba(8,109,255,0.16)] border-[#086DFF]"
                        : "bg-white border-[#E5E5E5] hover:bg-[#F8F9FC]"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center",
                      levelOfDetail === "summary" 
                        ? "border-hw-brand/20 bg-white" 
                        : "border-[#E5E5E5] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
                    )}>
                      {levelOfDetail === "summary" && (
                        <div className="w-2 h-2 rounded-full bg-[#086DFF]" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "text-sm font-medium tracking-[-0.14px] leading-5",
                        levelOfDetail === "summary" ? "text-[#086DFF]" : "text-[#1A1C2E]"
                      )}>Summary</span>
                      <p className="text-xs text-[#73777D] tracking-[-0.12px] leading-4">1 Line for all jobs (combined totals)</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setInvoiceData((prev) => ({ ...prev, levelOfDetail: "partial" }));
                      setViewMode(invoiceData.id, "partial");
                    }}
                    className={cn(
                      "flex-1 p-4 rounded-[10px] border text-left transition-colors flex gap-3 items-start",
                      levelOfDetail === "partial"
                        ? "bg-[rgba(8,109,255,0.16)] border-[#086DFF]"
                        : "bg-white border-[#E5E5E5] hover:bg-[#F8F9FC]"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center",
                      levelOfDetail === "partial" 
                        ? "border-hw-brand/20 bg-white" 
                        : "border-[#E5E5E5] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
                    )}>
                      {levelOfDetail === "partial" && (
                        <div className="w-2 h-2 rounded-full bg-[#086DFF]" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "text-sm font-medium tracking-[-0.14px] leading-5",
                        levelOfDetail === "partial" ? "text-[#086DFF]" : "text-[#1A1C2E]"
                      )}>Partial</span>
                      <p className="text-xs text-[#73777D] tracking-[-0.12px] leading-4">Separate lines for labour vs materials per job</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setInvoiceData((prev) => ({ ...prev, levelOfDetail: "detailed" }));
                      setViewMode(invoiceData.id, "detailed");
                    }}
                    className={cn(
                      "flex-1 p-4 rounded-[10px] border text-left transition-colors flex gap-3 items-start",
                      levelOfDetail === "partial"
                        ? "bg-white border-[#E5E5E5] hover:bg-[#F8F9FC]"
                        : levelOfDetail === "detailed"
                        ? "bg-[rgba(8,109,255,0.16)] border-[#086DFF]"
                        : "bg-white border-[#E5E5E5] hover:bg-[#F8F9FC]"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center",
                      levelOfDetail === "detailed" 
                        ? "border-hw-brand/20 bg-white" 
                        : "border-[#E5E5E5] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
                    )}>
                      {levelOfDetail === "detailed" && (
                        <div className="w-2 h-2 rounded-full bg-[#086DFF]" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "text-sm font-medium tracking-[-0.14px] leading-5",
                        levelOfDetail === "detailed" ? "text-[#086DFF]" : "text-[#1A1C2E]"
                      )}>Detailed</span>
                      <p className="text-xs text-[#73777D] tracking-[-0.12px] leading-4">Every line from every job</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Job List */}
              <div className="space-y-2">
              {levelOfDetail === "summary" ? (
                // Summary mode: show single consolidated job card
                (() => {
                  const firstJob = invoiceData.jobs[0];
                  // Calculate totals across all jobs
                  let totalLines = 0;
                  let includedLines = 0;
                  let totalValue = 0;
                  invoiceData.jobs.forEach((job) => {
                    const counts = getLineCounts(invoiceData.id, job.id);
                    totalLines += counts.total;
                    includedLines += counts.included;
                    totalValue += job.leftToInvoice;
                  });
                  
                  return (
                    <div className="flex items-center gap-3 pl-4 pr-3 py-3 bg-white border border-hw-border rounded-lg">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{firstJob?.jobRef || "INT/12345"}</span>
                          <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{firstJob?.completed || "Wed 21 May 2025"}</span>
                          <ResourceAvatar initials={firstJob?.jobCategory === "Internal" ? "CS" : "LB"} />
                        </div>
                        <div className="inline-flex items-center px-1.5 py-px h-5 rounded-md bg-[rgba(8,109,255,0.08)] border border-hw-brand/20 w-fit">
                          <span className="text-sm font-medium tracking-[-0.14px] text-[#0288D1]">
                            {includedLines} of {totalLines} lines
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">
                          {formatCurrency(totalValue)}
                        </span>
                        <button className="p-0 hover:bg-[rgba(11,38,66,0.08)] rounded transition-colors">
                          <MoreVertical className="h-5 w-5 text-[#0B2642]" />
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : invoiceData.jobs.map((job) => {
                const lineCounts = getLineCounts(invoiceData.id, job.id);
                const isJobSelected = selectedJobIdsSet.has(job.id);
                
                if (levelOfDetail === "partial") {
                  return (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 pl-4 pr-3 py-3 bg-white border border-hw-border rounded-lg h-[70px]"
                    >
                      <Checkbox
                        checked={isJobSelected}
                        onCheckedChange={(checked) => {
                          toggleJob(invoiceData.id, job.id, checked as boolean);
                          const newSelected = new Set(selectedJobIdsSet);
                          if (checked) {
                            newSelected.add(job.id);
                          } else {
                            newSelected.delete(job.id);
                          }
                          setInvoiceData((prev) => ({
                            ...prev,
                            selectedJobIds: Array.from(newSelected),
                          }));
                        }}
                      />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
                          <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "inline-flex items-center px-1.5 py-px h-5 rounded-md border",
                            isJobSelected 
                              ? "bg-[rgba(8,109,255,0.08)] border-hw-brand/20"
                              : "bg-[rgba(26,28,46,0.05)] border-hw-border"
                          )}>
                            <span className={cn(
                              "text-sm font-medium tracking-[-0.14px]",
                              isJobSelected ? "text-[#0288D1]" : "text-[#73777D]"
                            )}>
                              {lineCounts.included} lines
                            </span>
                          </div>
                          {job.jobCategory && (
                            <div className="inline-flex items-center px-1.5 py-px h-5 rounded-md bg-white border border-hw-border">
                              <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.jobCategory}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">
                        {formatCurrency(job.leftToInvoice)}
                      </div>
                    </div>
                  );
                }

                // Detailed view
                return (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 pl-4 pr-3 py-3 bg-white border border-hw-border rounded-lg h-[70px]"
                  >
                    <Checkbox
                      checked={isJobSelected}
                      onCheckedChange={(checked) => {
                        toggleJob(invoiceData.id, job.id, checked as boolean);
                        const newSelected = new Set(selectedJobIdsSet);
                        if (checked) {
                          newSelected.add(job.id);
                        } else {
                          newSelected.delete(job.id);
                        }
                        setInvoiceData((prev) => ({
                          ...prev,
                          selectedJobIds: Array.from(newSelected),
                        }));
                      }}
                    />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
                        <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "inline-flex items-center px-1.5 py-px h-5 rounded-md border",
                          isJobSelected 
                            ? "bg-[rgba(8,109,255,0.08)] border-hw-brand/20"
                            : "bg-[rgba(26,28,46,0.05)] border-hw-border"
                        )}>
                          <span className={cn(
                            "text-sm font-medium tracking-[-0.14px]",
                            isJobSelected ? "text-[#0288D1]" : "text-[#73777D]"
                          )}>
                            {lineCounts.included} lines
                          </span>
                        </div>
                        {job.jobCategory && (
                          <div className="inline-flex items-center px-1.5 py-px h-5 rounded-md bg-white border border-hw-border">
                            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.jobCategory}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">
                      {formatCurrency(job.leftToInvoice)}
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Send Invoice Split Button */}
              <div className="pt-8">
                <div className="flex items-stretch w-full rounded-md overflow-hidden shadow-[0_0_0_1px_rgba(7,98,229,0.8)]">
                  <button 
                    className="flex-1 flex items-center justify-center px-4 py-[6px] bg-[#086DFF] hover:bg-[#0752cc] text-white text-sm font-medium transition-colors disabled:opacity-50"
                    onClick={handleSendInvoice}
                    disabled={sentInvoiceIds.has(invoiceData.id)}
                  >
                    {sentInvoiceIds.has(invoiceData.id) ? "Already Sent" : "Send Invoice"}
                  </button>
                  <button 
                    className="flex items-center justify-center px-1 bg-[#086DFF] hover:bg-[#0752cc] border-l border-[#1A1C2E] disabled:opacity-50 transition-colors"
                    disabled={sentInvoiceIds.has(invoiceData.id)}
                  >
                    <ChevronDown className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - PDF Preview */}
        <div className="flex-1 bg-[#F9FAFD] overflow-auto flex flex-col items-center py-8 gap-4">
          {/* Header Row - Title and Actions */}
          <div className="w-[654px] flex items-center justify-between shrink-0">
            {/* Left - Site Title */}
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4 text-[#73777D] shrink-0" />
              <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] leading-4">
                {invoiceData.name} ({invoiceData.jobs.length} Jobs) – {formatCurrency(totalValue)}
              </span>
            </div>
            
            {/* Right - Actions and Send Invoice */}
            <div className="flex items-center gap-6 shrink-0">
              <Button variant="secondary" size="sm">
                Actions
              </Button>
              {/* Send Invoice Split Button */}
              <div className="flex items-stretch rounded-md overflow-hidden shadow-[0px_0px_0px_1px_rgba(7,98,229,0.8)]">
                <button 
                  className="flex items-center justify-center px-2 py-1.5 bg-[#086DFF] hover:bg-[#0752cc] text-white text-sm font-medium transition-colors"
                  onClick={handleSendInvoice}
                >
                  Send invoice
                </button>
                <button 
                  className="flex items-center justify-center px-1 bg-[#086DFF] hover:bg-[#0752cc] border-l border-[#1A1C2E]"
                >
                  <ChevronDown className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Preview Card */}
          <div className="bg-white w-[654px] rounded-modal border border-hw-border shadow-modal relative">
            {/* Inner border effect */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_0px_1px_white,inset_0px_0px_0px_2px_rgba(229,231,235,0.4)]" />
            
            {/* Invoice Content */}
            <div className="p-10 flex flex-col gap-6">
              {/* Draft Status Badge */}
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E6F3FA] border border-[rgba(2,136,209,0.2)] w-fit">
                <span className="text-xs font-medium text-[#0B2642] tracking-[-0.12px]">Draft</span>
              </div>

              {/* Header Row - Logo + Company Info + Dates */}
              <div className="flex items-start justify-between">
                {/* Left side - Logo placeholder and Company name */}
                <div className="flex flex-col gap-4">
                  {/* Logo placeholder */}
                  <div className="w-[114px] h-[68px] rounded-lg bg-[#F3F5F9] flex items-center justify-center">
                    <span className="text-xs font-medium text-[#086DFF] tracking-[-0.12px]">Add logo</span>
                  </div>
                  {/* Company name */}
                  <p className="text-base font-semibold text-[#0B2642]">BigChange Ltd</p>
                </div>
                
                {/* Right side - Invoice dates and details */}
                <div className="flex flex-col gap-4 w-[284px]">
                  {/* Issue date and Due date row */}
                  <div className="flex items-center justify-end gap-6">
                    <div className="flex flex-col gap-1 text-right w-[98px]">
                      <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px]">Issue date:</span>
                      <span className="text-sm text-[#0B2642] tracking-[-0.14px]">DD/MM/YYYY</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right w-[91px]">
                      <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px]">Due date:</span>
                      <span className="text-sm text-[#0B2642] tracking-[-0.14px]">DD/MM/YYYY</span>
                    </div>
                  </div>
                  {/* Invoice number and Reference row */}
                  <div className="flex items-center justify-end gap-6">
                    <div className="flex flex-col gap-1 text-right w-[128px]">
                      <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px]">Invoice Number:</span>
                      <span className="text-sm text-[#0B2642] tracking-[-0.14px]">IV/24245</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right w-[66px]">
                      <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px]">Reference:</span>
                      <span className="text-sm text-[#0B2642] tracking-[-0.14px]">243452</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To Section */}
              <div className="bg-[#F3F5F9] rounded-lg px-6 py-4 flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">BILL TO</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base font-medium text-[#0B2642] leading-6">{invoiceData.name || "Boots Pharmacy"}</span>
                    <span className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">Leeds, Victoria Gate, Harewood St, Leeds LS2 7AR</span>
                  </div>
                </div>
                <button className="text-sm font-medium text-[#086DFF] hover:underline">
                  Edit contact
                </button>
              </div>

              {/* Invoice Title Input */}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">Invoice title</span>
                <div className="w-[190px] px-2.5 py-1.5 bg-white shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)]">
                  <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{invoiceData.title || "Fire extinguisher service"}</span>
                </div>
              </div>

              {/* Jobs Section */}
              <div className="flex flex-col gap-3">
                {/* Jobs header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">Jobs</span>
                  <button className="text-sm font-medium text-[#086DFF] hover:underline">
                    Edit jobs
                  </button>
                </div>

                {/* Jobs Table */}
                <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] overflow-hidden">
                  {/* Table Header */}
                  <div className="flex items-center gap-5 px-3 py-2 bg-[#FCFCFD] border-b border-[rgba(16,25,41,0.1)]">
                    <span className="flex-1 text-sm font-medium text-[#73777D] tracking-[-0.14px]">Name</span>
                    <span className="w-[100px] text-sm font-medium text-[#73777D] tracking-[-0.14px] text-right">Unit price</span>
                    <span className="w-[100px] text-sm font-medium text-[#73777D] tracking-[-0.14px] text-right">Total</span>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="divide-y divide-[rgba(16,25,41,0.1)]">
                    <div className="flex items-center gap-5 px-3 py-2">
                      <div className="flex-1 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0E94EB]" />
                        <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Exit Sign Maintenance</span>
                      </div>
                      <span className="w-[100px] text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">£87.70</span>
                      <span className="w-[100px] text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">£657.75</span>
                    </div>
                    <div className="flex items-center gap-5 px-3 py-2">
                      <div className="flex-1 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FE8640]" />
                        <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Hose Reel Service</span>
                      </div>
                      <span className="w-[100px] text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">£3.89</span>
                      <span className="w-[100px] text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">£38.90</span>
                    </div>
                    <div className="flex items-center gap-5 px-3 py-2">
                      <div className="flex-1 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8C54CA]" />
                        <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Fire Door Inspection</span>
                      </div>
                      <span className="w-[100px] text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">£109.99</span>
                      <span className="w-[100px] text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">£109.99</span>
                    </div>
                    <div className="flex items-center gap-5 px-3 py-2">
                      <div className="flex-1 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8C54CA]" />
                        <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Portable Appliance Testing</span>
                      </div>
                      <span className="w-[100px] text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">£109.99</span>
                      <span className="w-[100px] text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">£109.99</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider Line */}
              <div className="w-full h-px bg-[#1A1C2E]" />

              {/* Notes and Totals Row */}
              <div className="flex items-start gap-10">
                {/* Notes Section */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">Notes</span>
                    <div className="w-full h-[66px] bg-white shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] px-2 py-2.5" />
                  </div>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-[#0B2642] w-fit">
                    <Paperclip className="h-4 w-4" />
                    Upload attachments
                  </button>
                </div>

                {/* Totals Section */}
                <div className="w-[309px] flex flex-col rounded-md overflow-hidden">
                  {/* Breakdown */}
                  <div className="flex flex-col gap-3 border-t border-[rgba(16,25,41,0.1)] pt-2 pb-3">
                    <div className="flex justify-between text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                      <span>Subtotal</span>
                      <span>£6,000.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                      <span>VAT (Rate)</span>
                      <span>£1,500.00</span>
                    </div>
                  </div>
                  {/* Total */}
                  <div className="flex justify-between text-sm font-medium text-[#0B2642] tracking-[-0.14px] border-t border-[rgba(16,25,41,0.1)] py-2.5">
                    <span>Total</span>
                    <span>£7,500.00</span>
                  </div>
                  {/* Amount Due */}
                  <div className="flex justify-between items-center border-t border-[rgba(16,25,41,0.1)] py-3">
                    <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Amount due</span>
                    <span className="text-xl font-bold text-[#0B2642] tracking-[-0.2px]">£7,500.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Page Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              className="p-1 rounded-md bg-white shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08)] hover:bg-[#F8F9FC] transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-6 w-6 text-[#0B2642]" />
            </button>
            <span className="text-base text-[#0B2642]">
              <span className="font-medium">Page 1</span>
              <span className="text-[#73777D]"> of 2</span>
            </span>
            <button
              className="p-1 rounded-md bg-white shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08)] hover:bg-[#F8F9FC] transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-6 w-6 text-[#0B2642]" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}


