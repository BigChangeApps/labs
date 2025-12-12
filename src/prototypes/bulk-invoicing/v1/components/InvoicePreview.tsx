import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Paperclip, FileText, Search, ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
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
      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(8,109,255,0.08)] border border-[rgba(2,136,209,0.2)]">
        <span className="text-sm font-medium text-[#0288d1] tracking-[-0.14px]">{selected} of {total} lines</span>
      </div>
    );
  }
  if (isInactive) {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(26,28,46,0.05)] border border-[rgba(26,28,46,0.12)]">
        <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{total} lines</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white border border-[rgba(26,28,46,0.12)] w-fit">
      <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{total} lines</span>
    </div>
  );
}

// Job type badge
function JobTypeBadge({ type }: { type: string }) {
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white border border-[rgba(26,28,46,0.12)]">
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
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
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
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
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
function SummaryJobView({ jobs, totalValue }: { jobs: JobWithLines[]; totalValue: number }) {
  const totalLines = jobs.reduce((sum, job) => {
    if (job.isGroupJob && job.childJobs) {
      return sum + job.childJobs.reduce((s, c) => s + c.linesCount, 0);
    }
    return sum + job.linesCount;
  }, 0);

  const firstJob = jobs[0];
  
  return (
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{firstJob?.jobRef || "EXT/12345"}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{firstJob?.completed || "Wed 21 May 2025"}</span>
            <ResourceAvatar initials={firstJob?.jobCategory === "Internal" ? "CS" : "LB"} />
          </div>
          <LinesBadge total={totalLines} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(totalValue)}</span>
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

// Detailed view - table with line items (read-only for preview)
function DetailedJobView({ 
  lineItems,
}: { 
  lineItems: LineItem[];
}) {
  return (
    <div className="border border-[rgba(26,28,46,0.12)] rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-[rgba(26,28,46,0.12)]">
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
          
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white">
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
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
      <div className="bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)] px-3 py-3">
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
          <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
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
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <div
            className="relative cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#73777D] pointer-events-none" />
            <Input
              type="text"
              placeholder="Add field..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="pl-8 h-9"
              readOnly={false}
            />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#73777D] pointer-events-none" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
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

  // Get level of detail, default to "partial" if not specified
  const levelOfDetail: LevelOfDetail = invoiceData.levelOfDetail || "partial";
  
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

  // Group jobs by category for display
  const jobsByCategory = useMemo(() => {
    const groups: Record<string, JobWithLines[]> = {
      "External": [],
      "Internal": [],
      "External, Internal": [],
    };
    
    invoiceData.jobs.forEach((job) => {
      if (groups[job.jobCategory]) {
        groups[job.jobCategory].push(job);
      }
    });
    
    return groups;
  }, [invoiceData.jobs]);

  // Calculate total value for summary view
  const totalValue = useMemo(() => {
    return invoiceData.jobs.reduce((sum, job) => {
      if (job.isGroupJob && job.childJobs) {
        return sum + job.childJobs.reduce((s, c) => s + c.leftToInvoice, 0) + 1000;
      }
      return sum + job.leftToInvoice;
    }, 0);
  }, [invoiceData.jobs]);

  // Generate line items for detailed view
  const lineItems = useMemo(() => generateLineItems(invoiceData.jobs), [invoiceData.jobs]);

  // Calculate totals based on level of detail and selections
  const { subtotal, vatAmount, total } = useMemo(() => {
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
  }, [invoiceData.jobs, levelOfDetail, selectedJobIdsSet, selectedGroupLinesSet, lineItems]);


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
      navigate("/bulk-invoicing/v1", {
        state: {
          success: true,
          message: `Successfully sent ${allInvoices.length} invoice${allInvoices.length > 1 ? 's' : ''}`,
        },
      });
    } else {
      // Single invoice - navigate back to jobs list
      navigate("/bulk-invoicing/v1", {
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
    <div className="h-screen bg-[#F8F9FC] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[rgba(26,28,46,0.12)] shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-[#0B2642]">
            Invoice {currentInvoiceIndex + 1} of {totalInvoiceCount}
          </h1>
          {sentInvoiceIds.has(invoiceData.id) && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
              <Check className="h-3.5 w-3.5 text-[#22c55e]" />
              <span className="text-xs font-medium text-[#22c55e]">Sent</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasMultipleInvoices && (
            <>
              <button
                onClick={handlePrevious}
                disabled={currentInvoiceIndex === 0}
                className="p-1.5 rounded-md hover:bg-[rgba(11,38,66,0.08)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                aria-label="Previous invoice"
              >
                <ChevronLeft className="h-5 w-5 text-[#0B2642]" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentInvoiceIndex === allInvoices.length - 1}
                className="p-1.5 rounded-md hover:bg-[rgba(11,38,66,0.08)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                aria-label="Next invoice"
              >
                <ChevronRight className="h-5 w-5 text-[#0B2642]" />
              </button>
            </>
          )}
          <button
            onClick={() => navigate("/bulk-invoicing/v1/create")}
            className="p-1.5 rounded-md hover:bg-[rgba(11,38,66,0.08)] transition-colors"
            aria-label="Close and return to create invoice"
          >
            <X className="h-5 w-5 text-[#0B2642]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Form */}
        <div className="w-[400px] bg-white border-r border-[rgba(26,28,46,0.12)] overflow-auto">
          <div className="p-8 space-y-6">
            {/* Invoice title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Invoice title
              </label>
              <Input
                type="text"
                value={invoiceData.title}
                onChange={(e) => updateInvoiceField("title", e.target.value)}
                className="h-10"
              />
            </div>

            {/* Nominal code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Nominal code
              </label>
              <Input type="text" value="5001" className="h-10" readOnly />
            </div>

            {/* Invoice number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Invoice number
              </label>
              <Input
                type="text"
                value={`HS/${invoiceData.invoiceNumber.toString().padStart(4, "0")}`}
                className="h-10"
                readOnly
              />
            </div>

            {/* Department code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Department code
              </label>
              <Input type="text" value="67800" className="h-10" readOnly />
            </div>

            {/* Send to */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Send to
              </label>
              <Input
                type="email"
                value="JohnLewis@gmail.com"
                className="h-10"
                readOnly
              />
            </div>

            {/* Line Level Detail Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
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
                  <div className="flex flex-wrap gap-2">
                    {selectedLineDetailFields.map((fieldKey) => {
                      const field = LINE_DETAIL_FIELDS.find((f) => f.key === fieldKey);
                      if (!field) return null;
                      return (
                        <div
                          key={fieldKey}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#F8F9FC] rounded-md text-sm text-[#0B2642]"
                        >
                          <span>{field.label}</span>
                          <button
                            onClick={() => handleRemoveField(fieldKey)}
                            className="hover:bg-[rgba(11,38,66,0.08)] rounded p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3 text-[#73777D]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            <AttachmentUploader
              attachments={invoiceData.attachments}
              onAttachmentsChange={(attachments) =>
                setInvoiceData((prev) => ({ ...prev, attachments }))
              }
            />

            {/* Send Invoice Button */}
            <div className="pt-4">
              <Button 
                variant="default" 
                onClick={handleSendInvoice}
                className="w-full"
                disabled={sentInvoiceIds.has(invoiceData.id)}
              >
                {sentInvoiceIds.has(invoiceData.id) ? "Already Sent" : "Send invoice"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - PDF Preview */}
        <div className="flex-1 bg-[#F0F2F5] overflow-auto p-8">
          <div className="bg-white rounded-lg shadow-[0px_2px_8px_rgba(0,0,0,0.08)] max-w-[600px] mx-auto">
            {/* Invoice Header */}
            <div className="px-8 py-6 border-b border-[rgba(26,28,46,0.08)]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2642]">Invoice</h2>
                  <p className="text-sm text-[#73777D] mt-1">BigChange Ltd</p>
                  <p className="text-sm text-[#73777D]">123 Business Street</p>
                  <p className="text-sm text-[#73777D]">Leeds, LS1 1AA</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-[#73777D]">Invoice Number</p>
                  <p className="font-bold text-[#0B2642]">
                    HS/{invoiceData.invoiceNumber.toString().padStart(4, "0")}
                  </p>
                  <p className="text-[#73777D] mt-2">
                    Issue Date {formatDisplayDate(invoiceData.issueDate)}
                  </p>
                  <p className="text-[#73777D]">
                    Due Date {formatDisplayDate(invoiceData.dueDate)}
                  </p>
                  <p className="text-[#73777D] mt-2">
                    Reference {invoiceData.reference || "-"}
                  </p>
                  <p className="text-[#73777D] mt-2">
                    Reference: {invoiceData.reference || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="px-8 py-4 border-b border-[rgba(26,28,46,0.08)]">
              <p className="text-xs font-medium text-[#73777D] uppercase tracking-wider mb-1">
                Bill To:
              </p>
              <p className="text-sm font-medium text-[#0B2642]">
                {invoiceData.name}
              </p>
              <p className="text-sm text-[#73777D]">{invoiceData.address}</p>
            </div>

            {/* Invoice Title */}
            <div className="px-8 py-4 border-b border-[rgba(26,28,46,0.08)]">
              <p className="font-bold text-[#0B2642]">{invoiceData.title}</p>
            </div>

            {/* Job Details (Read-only Preview) */}
            <div className="px-8 py-4 space-y-6">
              {levelOfDetail === "summary" && (
                <SummaryJobView 
                  jobs={invoiceData.jobs} 
                  totalValue={totalValue}
                />
              )}
              
              {levelOfDetail === "detailed" && (
                <DetailedJobView lineItems={lineItems} />
              )}
              
              {levelOfDetail === "partial" && (
                <>
                  {Object.entries(jobsByCategory).map(([category, jobs]) => {
                    if (jobs.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{category}</p>
                        {jobs.map(job => {
                          if (job.isGroupJob && job.childJobs) {
                            return (
                              <GroupJobCardPreview
                                key={job.id}
                                groupJob={job}
                                childJobs={job.childJobs}
                                selectedJobIds={selectedJobIdsSet}
                                selectedGroupLines={selectedGroupLinesSet}
                                showPartial={true}
                                selectedLineDetailFields={selectedLineDetailFields}
                              />
                            );
                          }
                          return <JobCard key={job.id} job={job} showPartial={true} selectedLineDetailFields={selectedLineDetailFields} />;
                        })}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Totals */}
            <div className="px-8 py-4 border-t border-[rgba(26,28,46,0.12)]">
              <div className="flex justify-end">
                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#73777D]">Subtotal</span>
                    <span className="text-[#0B2642]">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#73777D]">VAT (Rate)</span>
                    <span className="text-[#0B2642]">
                      {formatCurrency(vatAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-[rgba(26,28,46,0.08)]">
                    <span className="text-[#0B2642]">Total</span>
                    <span className="text-[#0B2642]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

