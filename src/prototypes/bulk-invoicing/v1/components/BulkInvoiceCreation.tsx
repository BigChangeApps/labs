import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronDown, 
  MoreVertical, 
  HelpCircle, 
  Check, 
  Paperclip,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { cn } from "@/registry/lib/utils";
import { type Job, formatCurrency } from "../lib/mock-data";
import { BreakdownModal } from "./BreakdownModal";

// Types
type BreakdownLevel = "contact" | "site" | "job";
type LevelOfDetail = "summary" | "partial" | "detailed";

interface JobWithLines extends Job {
  linesCount: number;
  selectedLinesCount: number;
  jobCategory: "External" | "Internal" | "External, Internal";
  isGroupJob: boolean;
  childJobs?: JobWithLines[];
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface InvoiceCardData {
  id: string;
  invoiceNumber: number;
  name: string;
  address: string;
  jobs: JobWithLines[];
  originalJobIds: string[]; // Track original job IDs from mockJobs
  // Per-card settings
  title: string;
  levelOfDetail: LevelOfDetail;
  isLevelOfDetailOverridden: boolean;
  reference: string;
  issueDate: string;
  dueDate: string;
  bankAccount: string;
  currency: string;
  notes: string;
  attachments: Attachment[];
}

// Constants
const structureLabels: Record<BreakdownLevel, string> = {
  contact: "Contact Level",
  site: "Site Level",
  job: "Job Level",
};

const levelOfDetailLabels: Record<LevelOfDetail, string> = {
  summary: "Summary",
  partial: "Partial",
  detailed: "Detailed",
};

const levelOfDetailOptions: LevelOfDetail[] = ["summary", "partial", "detailed"];

const bankAccountOptions = [
  { id: "barclays", label: "Barclays", last4: "1234" },
  { id: "hsbc", label: "HSBC", last4: "5678" },
  { id: "lloyds", label: "Lloyds", last4: "9012" },
];


// Helper to generate today's date in YYYY-MM-DD format
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// Helper to get date 30 days from now
function getDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
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
    year: "numeric" 
  });
  return isToday ? `${formatted} (Today)` : formatted;
}

// Editable Invoice Title Badge with number
function InvoiceTitleBadge({ 
  invoiceNumber,
  title, 
  onChange 
}: { 
  invoiceNumber: number;
  title: string; 
  onChange: (newTitle: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setEditValue(title);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== title) {
      onChange(editValue.trim());
    } else {
      setEditValue(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex w-fit items-center gap-1.5 px-1.5 py-1 rounded-md bg-[rgba(8,109,255,0.08)] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)]">
        <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{invoiceNumber}</span>
        <FileText className="h-4 w-4 text-[#73777D]" />
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] bg-transparent border-none outline-none w-[120px]"
        />
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex w-fit items-center gap-1.5 px-1.5 py-1 rounded-md bg-[rgba(8,109,255,0.08)] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-[rgba(8,109,255,0.12)] transition-colors cursor-pointer"
    >
      <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{invoiceNumber}</span>
      <FileText className="h-4 w-4 text-[#73777D]" />
      <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{title}</span>
    </button>
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

// Status badge component
function DraftBadge() {
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-white border border-[rgba(16,25,41,0.1)]">
      <span className="text-xs font-medium text-[#0B2642] tracking-[-0.12px]">Draft</span>
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
                <span className="text-sm text-[#0B2642] truncate">{attachment.name}</span>
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
        variant="outline" 
        size="sm" 
        className="gap-1.5 bg-white"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="h-4 w-4" />
        Upload attachments
      </Button>
    </div>
  );
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
      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(8,109,255,0.08)] border border-[rgba(2,136,209,0.2)] w-fit">
        <span className="text-sm font-medium text-[#0288d1] tracking-[-0.14px]">{selected} of {total} lines</span>
      </div>
    );
  }
  if (isInactive) {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(26,28,46,0.05)] border border-[rgba(26,28,46,0.12)] w-fit">
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


// Universal Level of Detail Select (full width)
function UniversalLevelOfDetailSelect({ 
  value, 
  onChange, 
}: { 
  value: LevelOfDetail; 
  onChange: (value: LevelOfDetail) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
          Level of detail <span className="font-normal text-[#73777D]">(for all invoices)</span>
        </span>
        <HelpCircle className="h-4 w-4 text-[#73777D]" />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{levelOfDetailLabels[value]}</span>
            <ChevronDown className="h-5 w-5 text-[#0B2642]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
          {levelOfDetailOptions.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2 py-2 text-sm rounded hover:bg-[#F8F9FC] transition-colors text-left",
                value === option ? "bg-[#F8F9FC] text-[#086DFF]" : "text-[#0B2642]"
              )}
            >
              <span>{levelOfDetailLabels[option]}</span>
              {value === option && <Check className="h-4 w-4 text-[#086DFF]" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}


// Generic Select dropdown
function GenericSelect({ 
  label, 
  value, 
  onChange, 
  options,
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value) || options[0];

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors text-left">
            <span className="text-sm font-normal text-[#73777D] tracking-[-0.14px]">{selected.label}</span>
            <ChevronDown className="h-5 w-5 text-[#0B2642]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2 py-2 text-sm rounded hover:bg-[#F8F9FC] transition-colors text-left",
                value === option.id ? "bg-[#F8F9FC] text-[#086DFF]" : "text-[#0B2642]"
              )}
            >
              <span>{option.label}</span>
              {value === option.id && <Check className="h-4 w-4 text-[#086DFF]" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}




// Nested job card with checkbox
function NestedJobCard({ 
  job,
  checked,
  onCheckedChange,
}: { 
  job: JobWithLines;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const isPartial = job.selectedLinesCount > 0 && job.selectedLinesCount < job.linesCount;
  
  return (
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Checkbox 
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
            <ResourceAvatar />
          </div>
          <div className="flex items-center gap-2">
            <LinesBadge 
              total={job.linesCount} 
              selected={isPartial ? job.selectedLinesCount : undefined}
              isPartial={isPartial && checked}
              isInactive={!checked}
            />
            <JobTypeBadge type={job.jobCategory} />
          </div>
        </div>
        <span className={cn(
          "text-sm font-bold tracking-[-0.14px]",
          checked ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)] line-through"
        )}>
          {formatCurrency(job.leftToInvoice)}
        </span>
      </div>
    </div>
  );
}

// Group job card
function GroupJobCard({ 
  groupJob,
  childJobs,
  selectedChildIds,
  onChildSelectionChange,
  groupLinesSelected,
  onGroupLinesSelectionChange,
}: { 
  groupJob: JobWithLines;
  childJobs: JobWithLines[];
  selectedChildIds: Set<string>;
  onChildSelectionChange: (jobId: string, checked: boolean) => void;
  groupLinesSelected?: boolean;
  onGroupLinesSelectionChange?: (checked: boolean) => void;
}) {
  const groupLinesValue = 1000;
  const childJobsValue = childJobs.reduce((sum, job) => 
    selectedChildIds.has(job.id) ? sum + job.leftToInvoice : sum, 0
  );
  const totalValue = childJobsValue + (groupLinesSelected ? groupLinesValue : 0);

  return (
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
      <div className="bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)] px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StacksIcon />
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{groupJob.jobRef}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">21 May - 3 June 2025</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(totalValue)}</span>
            <button className="p-0.5 hover:bg-white/50 rounded">
              <MoreVertical className="h-5 w-5 text-[#0B2642]" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Group-level lines */}
        {onGroupLinesSelectionChange && (
          <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <Checkbox 
                checked={groupLinesSelected}
                onCheckedChange={onGroupLinesSelectionChange}
              />
              <div className="flex-1 flex flex-col gap-1.5">
                <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">Group-level lines</span>
                <LinesBadge total={10} />
              </div>
              <span className={cn(
                "text-sm font-bold tracking-[-0.14px]",
                groupLinesSelected ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)]"
              )}>
                {formatCurrency(groupLinesValue)}
              </span>
            </div>
          </div>
        )}
        
        {childJobs.map((childJob) => (
          <NestedJobCard
            key={childJob.id}
            job={childJob}
            checked={selectedChildIds.has(childJob.id)}
            onCheckedChange={(checked) => onChildSelectionChange(childJob.id, checked as boolean)}
          />
        ))}
      </div>
    </div>
  );
}

// Invoice Card Component
function InvoiceCard({ 
  invoiceData,
  selectedJobIds,
  selectedGroupLines,
  onJobSelectionChange,
  onGroupLinesSelectionChange,
  onInvoiceDataChange,
  onPreview,
}: { 
  invoiceData: InvoiceCardData;
  selectedJobIds: Set<string>;
  selectedGroupLines: Set<string>;
  onJobSelectionChange: (jobId: string, checked: boolean) => void;
  onGroupLinesSelectionChange: (groupJobId: string, checked: boolean) => void;
  onInvoiceDataChange: (id: string, updates: Partial<InvoiceCardData>) => void;
  onPreview: () => void;
}) {
  const [jobsExpanded, setJobsExpanded] = useState(false);

  // Calculate per-card totals based on selected jobs
  const { cardSubtotal, cardVat, cardTotal } = useMemo(() => {
    let subtotal = 0;
    
    invoiceData.jobs.forEach(job => {
      if (job.isGroupJob && job.childJobs) {
        job.childJobs.forEach(child => {
          if (selectedJobIds.has(child.id)) {
            subtotal += child.leftToInvoice;
          }
        });
        if (selectedGroupLines.has(job.id)) {
          subtotal += job.leftToInvoice;
        }
      } else {
        if (selectedJobIds.has(job.id)) {
          subtotal += job.leftToInvoice;
        }
      }
    });
    
    const vatRate = 0.20;
    const vat = subtotal * vatRate;
    const total = subtotal + vat;
    
    return { cardSubtotal: subtotal, cardVat: vat, cardTotal: total };
  }, [invoiceData.jobs, selectedJobIds, selectedGroupLines]);

  // Get all non-group jobs and child jobs for the list
  const allSelectableJobs = useMemo(() => {
    const jobs: JobWithLines[] = [];
    invoiceData.jobs.forEach(job => {
      if (job.isGroupJob && job.childJobs) {
        // Group job - will be handled separately
      } else {
        jobs.push(job);
      }
    });
    return jobs;
  }, [invoiceData.jobs]);

  // Get group jobs
  const groupJobs = useMemo(() => {
    return invoiceData.jobs.filter(job => job.isGroupJob && job.childJobs);
  }, [invoiceData.jobs]);

  const selected = bankAccountOptions.find(b => b.id === invoiceData.bankAccount) || bankAccountOptions[0];

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08),0px_1px_2px_-1px_rgba(11,38,66,0.08),0px_2px_4px_0px_rgba(11,38,66,0.04)] overflow-hidden">
      {/* Invoice Header */}
      <div className="px-6 pt-6 pb-0">
        {/* Top row: Invoice badge, dates, bank account, reference, menu */}
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Invoice badge + Contact */}
          <div className="flex flex-col gap-4 flex-1">
            <InvoiceTitleBadge 
              invoiceNumber={invoiceData.invoiceNumber}
              title={invoiceData.title}
              onChange={(newTitle) => onInvoiceDataChange(invoiceData.id, { title: newTitle })}
            />
            
            {/* Contact Info */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{invoiceData.name}</span>
                <button className="text-sm font-normal text-[#086DFF] hover:underline tracking-[-0.14px]">Change</button>
              </div>
              <p className="text-sm font-normal text-[#555D66] tracking-[-0.14px] whitespace-pre-line">{invoiceData.address.split(", ").join(",\n")}</p>
            </div>
          </div>
          
          {/* Right side: Dates, Bank, Reference */}
          <div className="flex flex-col gap-4 items-end">
            {/* Row 1: Issue date, Due date, Menu */}
            <div className="flex items-start gap-6">
              <div className="flex flex-col gap-0.5 min-w-[125px]">
                <div className="flex items-center justify-end gap-1.5">
                  <Calendar className="h-4 w-4 text-[#73777D]" />
                  <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">Issue date</span>
                </div>
                <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px] text-right">{formatDisplayDate(invoiceData.issueDate)}</span>
              </div>
              
              <div className="flex flex-col gap-0.5 min-w-[125px]">
                <div className="flex items-center justify-end gap-1.5">
                  <Calendar className="h-4 w-4 text-[#73777D]" />
                  <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">Due date</span>
                </div>
                <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px] text-right">{formatDisplayDate(invoiceData.dueDate)}</span>
              </div>
              
              <button className="p-0.5 hover:bg-gray-100 rounded mt-0.5">
                <MoreVertical className="h-5 w-5 text-[#0B2642]" />
              </button>
            </div>
            
            {/* Row 2: Bank account, Reference */}
            <div className="flex items-start gap-6">
              <div className="flex flex-col gap-0.5 min-w-[125px]">
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.33325 6.00004L7.99992 2.66671L14.6666 6.00004L7.99992 9.33337L1.33325 6.00004Z" stroke="#73777D" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.33325 7.33337V11.3334C3.33325 11.3334 5.33325 13.3334 7.99992 13.3334C10.6666 13.3334 12.6666 11.3334 12.6666 11.3334V7.33337" stroke="#73777D" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">Bank account</span>
                </div>
                <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">{selected.label} ({selected.last4})</span>
              </div>
              
              <div className="flex flex-col gap-0.5 min-w-[125px]">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#73777D]" />
                  <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">Reference</span>
                </div>
                <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">{invoiceData.reference || "Heating Upgrade"}</span>
              </div>
              
              <button className="p-0.5 hover:bg-gray-100 rounded mt-0.5">
                <MoreVertical className="h-5 w-5 text-[#0B2642]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View/Hide Jobs Toggle */}
      <div className="px-6 py-4">
        <button
          onClick={() => setJobsExpanded(!jobsExpanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-[#F8F9FC] hover:bg-[#EEF1F6] transition-colors text-[#086DFF]"
        >
          {jobsExpanded ? (
            <>
              <ChevronDown className="h-5 w-5 rotate-180" />
              <span className="text-sm font-medium tracking-[-0.14px]">Hide jobs</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5" />
              <span className="text-sm font-medium tracking-[-0.14px]">View jobs</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Job Details Section */}
      {jobsExpanded && (
        <div className="px-6 pb-4 space-y-3">
          {/* Regular jobs */}
          {allSelectableJobs.map(job => {
            const isSelected = selectedJobIds.has(job.id);
            const isPartial = job.selectedLinesCount > 0 && job.selectedLinesCount < job.linesCount;
            
            return (
              <div key={job.id} className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={(checked) => onJobSelectionChange(job.id, checked as boolean)}
                  />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
                      <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
                      <ResourceAvatar />
                    </div>
                    <div className="flex items-center gap-2">
                      <LinesBadge 
                        total={job.linesCount} 
                        selected={isPartial ? job.selectedLinesCount : undefined}
                        isPartial={isPartial && isSelected}
                        isInactive={!isSelected}
                      />
                      <JobTypeBadge type={job.jobCategory} />
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-bold tracking-[-0.14px]",
                    isSelected ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)] line-through"
                  )}>
                    {formatCurrency(job.leftToInvoice)}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Group jobs */}
          {groupJobs.map(groupJob => (
            <GroupJobCard
              key={groupJob.id}
              groupJob={groupJob}
              childJobs={groupJob.childJobs || []}
              selectedChildIds={selectedJobIds}
              onChildSelectionChange={onJobSelectionChange}
              groupLinesSelected={selectedGroupLines.has(groupJob.id)}
              onGroupLinesSelectionChange={(checked) => onGroupLinesSelectionChange(groupJob.id, checked as boolean)}
            />
          ))}
          
          {/* Helper text */}
          <div className="flex items-center gap-1.5 pt-2">
            <HelpCircle className="h-4 w-4 text-[#73777D]" />
            <span className="text-xs font-normal text-[#73777D] tracking-[-0.12px]">
              Job selection only, line level detail can be toggled in the preview
            </span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[rgba(26,28,46,0.12)] mx-6" />

      {/* Totals Section */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#555D66] tracking-[-0.14px]">Subtotal</span>
          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(cardSubtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#555D66] tracking-[-0.14px]">VAT (Rate)</span>
          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(cardVat)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#555D66] tracking-[-0.14px]">Total</span>
          <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(cardSubtotal + cardVat)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(16,25,41,0.1)]">
          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">Amount due</span>
          <span className="text-xl font-bold text-[#0B2642] tracking-[-0.2px]">{formatCurrency(cardTotal)}</span>
        </div>
      </div>

      {/* Preview Button */}
      <div className="px-6 pb-6">
        <Button 
          variant="secondary" 
          size="default" 
          className="w-full"
          onClick={onPreview}
        >
          Preview invoice
        </Button>
      </div>
    </div>
  );
}

// Combined Overview & Settings Panel
function UniversalSettingsPanel({ 
  levelOfDetail,
  onLevelOfDetailChange,
  breakdownLevel,
  onBreakdownChange,
  department,
  nominalCode,
  currency,
  bankAccount,
  onDepartmentChange,
  onNominalCodeChange,
  onCurrencyChange,
  onBankAccountChange,
  subtotal,
  vatAmount,
  total,
  contactName,
  sites,
  referenceNumber,
  onPreviewAll,
}: { 
  levelOfDetail: LevelOfDetail;
  onLevelOfDetailChange: (value: LevelOfDetail) => void;
  breakdownLevel: BreakdownLevel;
  onBreakdownChange: () => void;
  department: string;
  nominalCode: string;
  currency: string;
  bankAccount: string;
  onDepartmentChange: (value: string) => void;
  onNominalCodeChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onBankAccountChange: (value: string) => void;
  subtotal: number;
  vatAmount: number;
  total: number;
  contactName: string;
  sites: string[];
  referenceNumber: string;
  onPreviewAll: () => void;
}) {
  const departmentOptions = [
    { id: "hs49301", label: "HS/49301" },
    { id: "hs49302", label: "HS/49302" },
    { id: "hs49303", label: "HS/49303" },
  ];

  const nominalCodeOptions = [
    { id: "5001", label: "5001" },
    { id: "5002", label: "5002" },
    { id: "5003", label: "5003" },
  ];

  const currencySelectOptions = [
    { id: "gbp", label: "Great British Pounds (GBP)" },
    { id: "usd", label: "US Dollar (USD)" },
    { id: "eur", label: "Euro (EUR)" },
  ];

  const bankAccountSelectOptions = [
    { id: "barclays", label: "Barclays 1234" },
    { id: "hsbc", label: "HSBC 5678" },
    { id: "lloyds", label: "Lloyds 9012" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)] overflow-hidden">
      {/* Overview Header */}
      <div className="px-5 pt-5 space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B2642] tracking-[-0.2px]">Overview</h2>
          <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{referenceNumber}</p>
        </div>
        <p className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{contactName}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E5E7EB] mx-0 my-4" />

      {/* Sites Section */}
      <div className="px-5 space-y-2">
        <p className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">Sites</p>
        <div className="space-y-1">
          {sites.map((site, index) => (
            <p key={index} className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{site}</p>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E5E7EB] mx-0 my-4" />

      {/* Settings Section */}
      <div className="px-5 pb-4 space-y-4">
        <p className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">Settings</p>
        
        <div className="space-y-3">
          <UniversalLevelOfDetailSelect
            value={levelOfDetail}
            onChange={onLevelOfDetailChange}
          />
          
          <GenericSelect
            label="Default department"
            value={department}
            onChange={onDepartmentChange}
            options={departmentOptions}
          />
          
          <GenericSelect
            label="Default nominal code"
            value={nominalCode}
            onChange={onNominalCodeChange}
            options={nominalCodeOptions}
          />

          <GenericSelect
            label="Currency"
            value={currency}
            onChange={onCurrencyChange}
            options={currencySelectOptions}
          />

          <GenericSelect
            label="Bank Account"
            value={bankAccount}
            onChange={onBankAccountChange}
            options={bankAccountSelectOptions}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{structureLabels[breakdownLevel]}</span>
              <HelpCircle className="h-4 w-4 text-[#73777D]" />
            </div>
            <button 
              onClick={onBreakdownChange}
              className="text-sm font-normal text-[#086DFF] hover:underline tracking-[-0.14px]"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Footer with Totals */}
      <div className="bg-[#F8F9FC] border-t border-[rgba(26,28,46,0.12)] px-5 py-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Sub-total</span>
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">VAT (Rate)</span>
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">24%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Group total</span>
            <span className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">{formatCurrency(total)}</span>
          </div>
        </div>
        
        <div className="flex items-stretch w-full rounded-[var(--hw-radius-button,0.375rem)] shadow-[0_0_0_1px_rgba(7,98,229,0.8)] overflow-hidden">
          <Button 
            variant="default" 
            size="default" 
            className="flex-1 rounded-r-none shadow-none"
            onClick={onPreviewAll}
          >
            Preview all invoices
          </Button>
          <button className="flex items-center justify-center px-2 bg-[#086dff] hover:bg-[#0752cc] border-l border-white/20">
            <ChevronDown className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function BulkInvoiceCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const locationState = (location.state || {}) as { 
    selectedJobs?: Job[]; 
    breakdownLevel?: BreakdownLevel;
    levelOfDetail?: LevelOfDetail;
  };
  
  // Use demo jobs if none selected (for testing)
  const demoJobs: Job[] = [
    { id: "demo-1", jobRef: "381910", site: "Next Arndale Manchester", parent: "Next Head Office", completed: "18 Mar 2024", status: "Complete", selling: 8393, leftToInvoice: 5000, progress: 100, jobType: "home_repair" },
    { id: "demo-2", jobRef: "382011", site: "Next Bull Ring Birmingham", parent: "Next Head Office", completed: "5 Mar 2024", status: "Complete", selling: 7450, leftToInvoice: 4500, progress: 100, jobType: "stacks" },
    { id: "demo-3", jobRef: "382112", site: "Next Trafford Centre", parent: "Next Head Office", completed: "15 Jan 2024", status: "Complete", selling: 9200, leftToInvoice: 6000, progress: 100, jobType: "stacks" },
  ];
  
  // If selectedJobs is explicitly provided (even if empty), use it; otherwise use demoJobs for testing
  const selectedJobs = locationState.selectedJobs !== undefined ? locationState.selectedJobs : demoJobs;
  const breakdownLevel = locationState.breakdownLevel || "contact" as BreakdownLevel;
  const initialLevelOfDetail = locationState.levelOfDetail || "partial" as LevelOfDetail;

  // Universal controls state
  const [universalLevelOfDetail, setUniversalLevelOfDetail] = useState<LevelOfDetail>(initialLevelOfDetail);
  const [universalStructure, setUniversalStructure] = useState<BreakdownLevel>(breakdownLevel);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [department, setDepartment] = useState("hs49301");
  const [nominalCode, setNominalCode] = useState("5001");
  const [universalCurrency, setUniversalCurrency] = useState("gbp");
  const [universalBankAccount, setUniversalBankAccount] = useState("barclays");
  
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    const uniqueParents = [...new Set(selectedJobs.map(j => j.parent))];
    uniqueParents.forEach((_, groupIndex) => {
      // Select non-group jobs
      ids.add(`${groupIndex}-ext-1`);
      ids.add(`${groupIndex}-int-1`);
      // Select group child jobs
      ids.add(`${groupIndex}-group-child-1`);
      ids.add(`${groupIndex}-group-child-2`);
    });
    return ids;
  });

  
  // Group lines selection state
  const [selectedGroupLines, setSelectedGroupLines] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    const uniqueParents = [...new Set(selectedJobs.map(j => j.parent))];
    uniqueParents.forEach((_, groupIndex) => {
      ids.add(`${groupIndex}-group`);
    });
    return ids;
  });

  // Function to generate invoice cards based on breakdown level
  const generateInvoiceCards = useCallback((jobs: Job[], breakdown: BreakdownLevel, currentLevelOfDetail: LevelOfDetail): InvoiceCardData[] => {
    let groupedJobs: Record<string, Job[]> = {};
    
    if (breakdown === "contact") {
      // Group by parent (contact)
      groupedJobs = jobs.reduce((acc, job) => {
        if (!acc[job.parent]) acc[job.parent] = [];
        acc[job.parent].push(job);
        return acc;
      }, {} as Record<string, Job[]>);
    } else if (breakdown === "site") {
      // Group by site
      groupedJobs = jobs.reduce((acc, job) => {
        const key = job.site || job.parent;
        if (!acc[key]) acc[key] = [];
        acc[key].push(job);
        return acc;
      }, {} as Record<string, Job[]>);
    } else {
      // Job level - each job is its own invoice
      groupedJobs = jobs.reduce((acc, job) => {
        acc[job.jobRef] = [job];
        return acc;
      }, {} as Record<string, Job[]>);
    }

    return Object.entries(groupedJobs).map(([groupKey, groupJobs], groupIndex): InvoiceCardData => {
      const baseJob = groupJobs[0] || { id: "1", parent: groupKey, site: "", jobRef: "", completed: "", status: "Complete" as const, selling: 0, leftToInvoice: 0, progress: 0, jobType: "home_repair" as const };
      
      const jobsWithLines: JobWithLines[] = [
        {
          ...baseJob,
          id: `${groupIndex}-ext-1`,
          jobRef: `EXT/${24680 + groupIndex}`,
          completed: "Wed 21 May 2025",
          linesCount: 20,
          selectedLinesCount: 20,
          jobCategory: "External",
          isGroupJob: false,
          leftToInvoice: 2000,
        },
        {
          ...baseJob,
          id: `${groupIndex}-int-1`,
          jobRef: `INT/${24680 + groupIndex}`,
          completed: "Wed 21 May 2025",
          linesCount: 30,
          selectedLinesCount: 20,
          jobCategory: "Internal",
          isGroupJob: false,
          leftToInvoice: 2000,
        },
        {
          ...baseJob,
          id: `${groupIndex}-group`,
          jobRef: `G/JOB${2468 + groupIndex}`,
          completed: "21 May - 3 June 2025",
          linesCount: 10,
          selectedLinesCount: 10,
          jobCategory: "External, Internal",
          isGroupJob: true,
          leftToInvoice: 1000,
          childJobs: [
            {
              ...baseJob,
              id: `${groupIndex}-group-child-1`,
              jobRef: `JOB/${2469 + groupIndex}`,
              completed: "Wed 21 May 2025",
              linesCount: 12,
              selectedLinesCount: 10,
              leftToInvoice: 1000,
              jobCategory: "External",
              isGroupJob: false,
            },
            {
              ...baseJob,
              id: `${groupIndex}-group-child-2`,
              jobRef: `JOB/${2470 + groupIndex}`,
              completed: "Mon 2 June 2025",
              linesCount: 12,
              selectedLinesCount: 10,
              leftToInvoice: 1000,
              jobCategory: "Internal",
              isGroupJob: false,
            },
            {
              ...baseJob,
              id: `${groupIndex}-group-child-3`,
              jobRef: `JOB/${2471 + groupIndex}`,
              completed: "Tue 3 June 2025",
              linesCount: 25,
              selectedLinesCount: 0,
              leftToInvoice: 1000,
              jobCategory: "Internal",
              isGroupJob: false,
            },
          ],
        },
      ];

      // Determine the name based on breakdown level
      const name = breakdown === "contact" ? baseJob.parent : 
                   breakdown === "site" ? (baseJob.site || baseJob.parent) : 
                   baseJob.jobRef;

      return {
        id: `invoice-${groupIndex}`,
        invoiceNumber: groupIndex + 1,
        name,
        address: "1 Drummond Gate, Pimlico, London, SW1V 2QQ",
        jobs: jobsWithLines,
        originalJobIds: groupJobs.map(job => job.id), // Store original job IDs
        title: "Invoice title",
        levelOfDetail: currentLevelOfDetail,
        isLevelOfDetailOverridden: false,
        reference: "",
        issueDate: getToday(),
        dueDate: getDueDate(),
        bankAccount: "barclays",
        currency: "gbp",
        notes: "",
        attachments: [],
      };
    });
  }, []);

  // Transform jobs into invoice cards
  const [invoiceCards, setInvoiceCards] = useState<InvoiceCardData[]>(() => {
    return generateInvoiceCards(selectedJobs, breakdownLevel, "partial");
  });

  const handleUniversalLevelOfDetailChange = useCallback((value: LevelOfDetail) => {
    setUniversalLevelOfDetail(value);
    setInvoiceCards(prev => prev.map(card => {
      if (!card.isLevelOfDetailOverridden) {
        return { ...card, levelOfDetail: value };
      }
      return card;
    }));
  }, []);

  const handleBreakdownChange = useCallback(() => {
    setBreakdownModalOpen(true);
  }, []);

  const handleBreakdownConfirm = useCallback((confirmedStructure: BreakdownLevel, confirmedLevelOfDetail: LevelOfDetail) => {
    setUniversalStructure(confirmedStructure);
    setUniversalLevelOfDetail(confirmedLevelOfDetail);
    
    // Regenerate invoice cards based on new breakdown level and level of detail
    const newCards = generateInvoiceCards(selectedJobs, confirmedStructure, confirmedLevelOfDetail);
    setInvoiceCards(newCards);
    
    // Reset selections for the new cards
    const newJobIds = new Set<string>();
    const newGroupLines = new Set<string>();
    newCards.forEach((_, groupIndex) => {
      // Select non-group jobs
      newJobIds.add(`${groupIndex}-ext-1`);
      newJobIds.add(`${groupIndex}-int-1`);
      // Select group child jobs
      newJobIds.add(`${groupIndex}-group-child-1`);
      newJobIds.add(`${groupIndex}-group-child-2`);
      newGroupLines.add(`${groupIndex}-group`);
    });
    setSelectedJobIds(newJobIds);
    setSelectedGroupLines(newGroupLines);
    
    setBreakdownModalOpen(false);
  }, [generateInvoiceCards, selectedJobs]);

  const handleInvoiceDataChange = useCallback((id: string, updates: Partial<InvoiceCardData>) => {
    setInvoiceCards(prev => prev.map(card => {
      if (card.id === id) {
        return { ...card, ...updates };
      }
      return card;
    }));
  }, []);

  const handleJobSelectionChange = (jobId: string, checked: boolean) => {
    const newSelected = new Set(selectedJobIds);
    if (checked) {
      newSelected.add(jobId);
    } else {
      newSelected.delete(jobId);
    }
    setSelectedJobIds(newSelected);
  };

  const handleGroupLinesSelectionChange = useCallback((groupJobId: string, checked: boolean) => {
    const newSelected = new Set(selectedGroupLines);
    if (checked) {
      newSelected.add(groupJobId);
    } else {
      newSelected.delete(groupJobId);
    }
    setSelectedGroupLines(newSelected);
  }, [selectedGroupLines]);

  // Calculate totals dynamically based on selections
  const summary = useMemo(() => {
    let subtotal = 0;
    
    invoiceCards.forEach(card => {
      card.jobs.forEach(job => {
        if (job.isGroupJob && job.childJobs) {
          // Add selected child jobs
          job.childJobs.forEach(child => {
            if (selectedJobIds.has(child.id)) {
              subtotal += child.leftToInvoice;
            }
          });
          // Add group-level lines if selected
          if (selectedGroupLines.has(job.id)) {
            subtotal += job.leftToInvoice;
          }
        } else {
          if (selectedJobIds.has(job.id)) {
            subtotal += job.leftToInvoice;
          }
        }
      });
    });
    
    const vatRate = 0.20; // 20% VAT
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  }, [invoiceCards, selectedJobIds, selectedGroupLines]);

  // Handle preview invoice - navigate to preview page
  const handlePreviewInvoice = useCallback((invoiceId?: string) => {
    // If invoiceId is provided, preview that specific invoice
    // Otherwise, preview the first (or only) invoice
    const idToPreview = invoiceId || invoiceCards[0]?.id;
    const invoiceToPreview = invoiceCards.find(card => card.id === idToPreview);
    const invoiceIndex = invoiceCards.findIndex(card => card.id === idToPreview);
    
    if (invoiceToPreview) {
      // Prepare all invoices with selection state for preview
      const allInvoices = invoiceCards.map(card => ({
        ...card,
        selectedJobIds: Array.from(selectedJobIds),
        selectedGroupLines: Array.from(selectedGroupLines),
      }));
      
      // Also include single invoice data for backward compatibility
      const previewData = {
        ...invoiceToPreview,
        selectedJobIds: Array.from(selectedJobIds),
        selectedGroupLines: Array.from(selectedGroupLines),
      };
      
      navigate("/bulk-invoicing/v1/preview", {
        state: { 
          invoiceData: previewData, // Legacy support
          allInvoices: allInvoices, // New: all invoices
          totalInvoiceCount: invoiceCards.length,
          currentInvoiceIndex: invoiceIndex
        }
      });
    }
  }, [invoiceCards, navigate, selectedJobIds, selectedGroupLines]);

  // Monitor sticky behavior
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkStickyBehavior = () => {
      const rightCol = rightColRef.current;
      if (!rightCol) return;

      // Find the sticky inner div
      const stickyInner = rightCol.querySelector('[class*="sticky"]') as HTMLElement;
      const windowScrollY = window.scrollY;
      const windowInnerHeight = window.innerHeight;

      if (stickyInner) {
        const stickyRect = stickyInner.getBoundingClientRect();
        const rightColRect = rightCol.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(stickyInner);
        const containingBlock = stickyInner.offsetParent as HTMLElement;
        const containingBlockRect = containingBlock?.getBoundingClientRect();

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cf7df69f-f856-4874-ac6a-b53ffb85f438',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BulkInvoiceCreation.tsx:useEffect-sticky',message:'Sticky behavior after fix',data:{stickyTop:stickyRect.top,stickyBottom:stickyRect.bottom,rightColTop:rightColRect.top,rightColBottom:rightColRect.bottom,windowScrollY,windowInnerHeight,computedPosition:computedStyle.position,computedTop:computedStyle.top,shouldBeStuck:stickyRect.top <= 77 && stickyRect.top >= 77 - 5,containingBlockTag:containingBlock?.tagName,containingBlockTop:containingBlockRect?.top},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    };

    // Check on mount and scroll
    setTimeout(checkStickyBehavior, 0);
    window.addEventListener('scroll', checkStickyBehavior, { passive: true });
    window.addEventListener('resize', checkStickyBehavior);

    return () => {
      window.removeEventListener('scroll', checkStickyBehavior);
      window.removeEventListener('resize', checkStickyBehavior);
    };
  }, [invoiceCards]);

  if (selectedJobs.length === 0) {
    navigate("/bulk-invoicing/v1/empty", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      {/* Subheader */}
      <header className="sticky top-0 z-10 bg-white border-b border-[rgba(16,25,41,0.1)]">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigate("/bulk-invoicing/v1")}
                className="text-sm font-medium text-[#475467] hover:text-[#0B2642] tracking-[-0.14px]"
              >
                Jobs ready to invoice
              </button>
              <ChevronRight className="h-4 w-4 text-[#475467]" />
              <span className="text-sm font-bold text-[#101929] tracking-[-0.14px]">Invoice/1234</span>
            </div>
            <DraftBadge />
          </div>
          <Button variant="outline" size="sm" className="bg-white">
            Save as draft
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-5">
        <div className="flex gap-6 items-start justify-center max-w-[1240px] mx-auto">
          {/* Left Column - Invoice Cards */}
          <div className="w-[820px] shrink-0 self-start">
            <div className="space-y-4">
              {invoiceCards.map((invoiceData) => (
                <InvoiceCard
                  key={invoiceData.id}
                  invoiceData={invoiceData}
                  selectedJobIds={selectedJobIds}
                  selectedGroupLines={selectedGroupLines}
                  onJobSelectionChange={handleJobSelectionChange}
                  onGroupLinesSelectionChange={handleGroupLinesSelectionChange}
                  onInvoiceDataChange={handleInvoiceDataChange}
                  onPreview={() => handlePreviewInvoice(invoiceData.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Settings & Overview (Sticky) */}
          <div ref={rightColRef} className="w-[380px] shrink-0 self-start">
            <div className="sticky top-[77px] h-fit z-10 text-left">
              <UniversalSettingsPanel
                levelOfDetail={universalLevelOfDetail}
                onLevelOfDetailChange={handleUniversalLevelOfDetailChange}
                breakdownLevel={universalStructure}
                onBreakdownChange={handleBreakdownChange}
                department={department}
                nominalCode={nominalCode}
                currency={universalCurrency}
                bankAccount={universalBankAccount}
                onDepartmentChange={setDepartment}
                onNominalCodeChange={setNominalCode}
                onCurrencyChange={setUniversalCurrency}
                onBankAccountChange={setUniversalBankAccount}
                subtotal={summary.subtotal}
                vatAmount={summary.vatAmount}
                total={summary.total}
                contactName={invoiceCards[0]?.name || ""}
                sites={[...new Set(invoiceCards.map(card => card.name))]}
                referenceNumber="AFP/0001"
                onPreviewAll={() => handlePreviewInvoice()}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Breakdown Modal */}
      <BreakdownModal
        open={breakdownModalOpen}
        onOpenChange={setBreakdownModalOpen}
        selectedJobs={selectedJobs}
        onCreateInvoice={handleBreakdownConfirm}
        currentBreakdownLevel={(universalStructure === "job" ? "contact" : universalStructure) as "contact" | "site"}
        currentLevelOfDetail={universalLevelOfDetail}
      />

    </div>
  );
}
