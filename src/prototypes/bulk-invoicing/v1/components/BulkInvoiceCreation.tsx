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
import { Input } from "@/registry/ui/input";
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

const currencyOptions = [
  { id: "gbp", label: "British Pound", symbol: "£" },
  { id: "usd", label: "US Dollar", symbol: "$" },
  { id: "eur", label: "Euro", symbol: "€" },
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
      <div className="inline-flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-[rgba(8,109,255,0.08)] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)]">
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
      className="inline-flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-[rgba(8,109,255,0.08)] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-[rgba(8,109,255,0.12)] transition-colors cursor-pointer"
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

// Override tag
function OverrideTag() {
  return (
    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[rgba(8,109,255,0.08)]">
      <span className="text-xs font-normal text-[#0288d1] tracking-[-0.12px]">Override</span>
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

// Level of Detail Select with Override tag
function LevelOfDetailSelect({ 
  value, 
  onChange, 
  showOverrideTag = false,
}: { 
  value: LevelOfDetail; 
  onChange: (value: LevelOfDetail) => void;
  showOverrideTag?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-[220px]">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Level of detail</span>
        <HelpCircle className="h-4 w-4 text-[#73777D]" />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors max-w-[220px]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{levelOfDetailLabels[value]}</span>
              {showOverrideTag && <OverrideTag />}
            </div>
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
          <button className="flex items-center justify-between w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors max-w-[220px]">
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

// Date Select
function DateSelect({ 
  label, 
  value, 
  onChange,
}: { 
  label: string;
  value: string; 
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors max-w-[220px]">
            <Calendar className="h-5 w-5 text-[#0B2642]" />
            <span className="flex-1 text-left text-sm font-normal text-[#0B2642] tracking-[-0.14px]">
              {formatDisplayDate(value)}
            </span>
            <ChevronDown className="h-5 w-5 text-[#0B2642]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <Input
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(false);
            }}
            className="h-9"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Bank Account Select
function BankAccountSelect({ 
  value, 
  onChange,
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = bankAccountOptions.find(b => b.id === value) || bankAccountOptions[0];

  return (
    <div className="flex flex-col gap-1.5 w-fit">
      <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Bank account</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors text-left max-w-[220px]">
            <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">
              {selected.label} ({selected.last4})
            </span>
            <ChevronDown className="h-5 w-5 text-[#0B2642]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
          {bankAccountOptions.map((option) => (
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
              <span>{option.label} ({option.last4})</span>
              {value === option.id && <Check className="h-4 w-4 text-[#086DFF]" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Currency Select
function CurrencySelect({ 
  value, 
  onChange,
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = currencyOptions.find(c => c.id === value) || currencyOptions[0];

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Currency</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors text-left max-w-[247px]">
            <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">
              <span className="font-semibold">{selected.symbol}</span> {selected.label}
            </span>
            <ChevronDown className="h-5 w-5 text-[#0B2642]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
          {currencyOptions.map((option) => (
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
              <span><span className="font-semibold">{option.symbol}</span> {option.label}</span>
              {value === option.id && <Check className="h-4 w-4 text-[#086DFF]" />}
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
          <button className="flex items-center justify-between w-full px-2 py-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:bg-gray-50 transition-colors text-left max-w-[220px]">
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

// Mock line items for detailed view
interface LineItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
  category: "blue" | "orange" | "purple";
  selected: boolean;
}

const mockLineItems: LineItem[] = [
  { id: "1", name: "Smoke Alarm Testing", qty: 2.0, unitPrice: 100, total: 100, category: "blue", selected: true },
  { id: "2", name: "Emergency Light Check", qty: 3.0, unitPrice: 150, total: 150, category: "orange", selected: true },
  { id: "3", name: "First Aid Kit Restock", qty: 4.0, unitPrice: 200, total: 200, category: "purple", selected: true },
  { id: "4", name: "Health and Safety Audit", qty: 5.0, unitPrice: 300, total: 300, category: "orange", selected: true },
  { id: "5", name: "Electrical Safety Inspection", qty: 6.0, unitPrice: 1200, total: 1200, category: "blue", selected: true },
  { id: "6", name: "Fire Safety Training", qty: 7.0, unitPrice: 3000, total: 3000, category: "blue", selected: true },
  { id: "7", name: "Building Security Review", qty: 8.0, unitPrice: 2000, total: 2000, category: "orange", selected: true },
  { id: "8", name: "Hazardous Material Handling", qty: 9.0, unitPrice: 1500, total: 1500, category: "blue", selected: true },
  { id: "9", name: "Workplace Ergonomic Assessment", qty: 10.0, unitPrice: 1000, total: 1000, category: "purple", selected: true },
  { id: "10", name: "Annual Compliance Review", qty: 11.0, unitPrice: 2000, total: 2000, category: "blue", selected: true },
];

// Category dot indicator
function CategoryDot({ category }: { category: "blue" | "orange" | "purple" }) {
  const colors = {
    blue: "bg-[#086DFF]",
    orange: "bg-[#F59E0B]",
    purple: "bg-[#8B5CF6]",
  };
  return <div className={cn("w-2 h-2 rounded-full", colors[category])} />;
}

// Single job card
function JobCard({ job }: { job: JobWithLines }) {
  const isPartial = job.selectedLinesCount > 0 && job.selectedLinesCount < job.linesCount;
  
  return (
    <div className="bg-white rounded-lg border border-[rgba(26,28,46,0.12)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{job.jobRef}</span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{job.completed}</span>
            <ResourceAvatar initials={job.jobCategory === "Internal" ? "CS" : "LB"} />
          </div>
          <LinesBadge 
            total={job.linesCount} 
            selected={isPartial ? job.selectedLinesCount : undefined}
            isPartial={isPartial}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(job.leftToInvoice)}</span>
          <button className="p-0.5 hover:bg-gray-100 rounded">
            <MoreVertical className="h-5 w-5 text-[#0B2642]" />
          </button>
        </div>
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
            <ResourceAvatar />
          </div>
          <LinesBadge total={totalLines} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#0B2642] tracking-[-0.14px]">{formatCurrency(totalValue)}</span>
          <button className="p-0.5 hover:bg-gray-100 rounded">
            <MoreVertical className="h-5 w-5 text-[#0B2642]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Detailed view - table with line items
function DetailedJobView({ 
  lineItems, 
  onLineItemToggle,
  onSelectAll,
  allSelected,
}: { 
  lineItems: LineItem[];
  onLineItemToggle: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
}) {
  return (
    <div className="border border-[rgba(26,28,46,0.12)] rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-[rgba(26,28,46,0.12)]">
        <Checkbox 
          checked={allSelected}
          onCheckedChange={onSelectAll}
        />
        <span className="flex-1 text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Name</span>
        <span className="w-16 text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-center">Qty</span>
        <span className="w-24 text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">Unit price</span>
        <span className="w-24 text-sm font-medium text-[#0B2642] tracking-[-0.14px] text-right">Total</span>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-[rgba(26,28,46,0.08)]">
        {lineItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#F8F9FC] transition-colors">
            <Checkbox 
              checked={item.selected}
              onCheckedChange={() => onLineItemToggle(item.id)}
            />
            <div className="flex-1 flex items-center gap-2">
              <CategoryDot category={item.category} />
              <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px]">{item.name}</span>
            </div>
            <span className="w-16 text-sm font-normal text-[#0B2642] tracking-[-0.14px] text-center">{item.qty.toFixed(1)}</span>
            <span className="w-24 text-sm font-normal text-[#0B2642] tracking-[-0.14px] text-right">{formatCurrency(item.unitPrice)}</span>
            <span className="w-24 text-sm font-normal text-[#0B2642] tracking-[-0.14px] text-right">{formatCurrency(item.total)}</span>
          </div>
        ))}
      </div>
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
  universalLevelOfDetail,
  lineItems,
  onLineItemToggle,
  onSelectAllLineItems,
  totalInvoiceCount,
  onPreview,
}: { 
  invoiceData: InvoiceCardData;
  selectedJobIds: Set<string>;
  selectedGroupLines: Set<string>;
  onJobSelectionChange: (jobId: string, checked: boolean) => void;
  onGroupLinesSelectionChange: (groupJobId: string, checked: boolean) => void;
  onInvoiceDataChange: (id: string, updates: Partial<InvoiceCardData>) => void;
  universalLevelOfDetail: LevelOfDetail;
  lineItems: LineItem[];
  onPreview: () => void;
  onLineItemToggle: (id: string) => void;
  onSelectAllLineItems: () => void;
  totalInvoiceCount: number;
}) {
  // Group jobs by category
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
        return sum + job.childJobs.reduce((s, c) => s + c.leftToInvoice, 0);
      }
      return sum + job.leftToInvoice;
    }, 0);
  }, [invoiceData.jobs]);

  // Calculate per-card totals based on level of detail
  const { cardSubtotal, cardVat, cardTotal } = useMemo(() => {
    let subtotal = 0;
    const levelOfDetail = invoiceData.levelOfDetail;
    
    if (levelOfDetail === "detailed") {
      // For detailed view, sum selected line items
      lineItems.forEach(item => {
        if (item.selected) {
          subtotal += item.total;
        }
      });
    } else if (levelOfDetail === "summary") {
      // For summary view, include all jobs
      invoiceData.jobs.forEach(job => {
        if (job.isGroupJob && job.childJobs) {
          job.childJobs.forEach(child => {
            subtotal += child.leftToInvoice;
          });
          if (selectedGroupLines.has(job.id)) {
            subtotal += job.leftToInvoice;
          }
        } else {
          subtotal += job.leftToInvoice;
        }
      });
    } else {
      // For partial view, sum based on selected jobs and group lines
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
          subtotal += job.leftToInvoice;
        }
      });
    }
    
    const vatRate = 0.20;
    const vat = subtotal * vatRate;
    const total = subtotal + vat;
    
    return { cardSubtotal: subtotal, cardVat: vat, cardTotal: total };
  }, [invoiceData.jobs, invoiceData.levelOfDetail, selectedJobIds, selectedGroupLines, lineItems]);

  const handleLevelOfDetailChange = (value: LevelOfDetail) => {
    // Update the invoice card's level of detail
    onInvoiceDataChange(invoiceData.id, { 
      levelOfDetail: value,
      isLevelOfDetailOverridden: value !== universalLevelOfDetail,
    });
  };

  const allLineItemsSelected = lineItems.every(item => item.selected);

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08),0px_1px_2px_-1px_rgba(11,38,66,0.08),0px_2px_4px_0px_rgba(11,38,66,0.04)] overflow-hidden">
      {/* Invoice Header & Settings */}
      <div className="px-6 pt-5 pb-6 space-y-6">
        {/* Invoice Title Badge with Number */}
        <InvoiceTitleBadge 
          invoiceNumber={invoiceData.invoiceNumber}
          title={invoiceData.title}
          onChange={(newTitle) => onInvoiceDataChange(invoiceData.id, { title: newTitle })}
        />

        {/* Level of Detail */}
        <LevelOfDetailSelect
          value={invoiceData.levelOfDetail}
          onChange={handleLevelOfDetailChange}
          showOverrideTag={invoiceData.isLevelOfDetailOverridden}
        />

        {/* Contact Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{invoiceData.name}</span>
            <span className="text-sm font-normal text-[#73777D] tracking-[-0.14px]">Change</span>
          </div>
          <p className="text-sm font-normal text-[#555D66] tracking-[-0.14px]">{invoiceData.address}</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Row 1: Reference, Issue Date, Due Date */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">Reference (optional)</span>
              <input
                type="text"
                value={invoiceData.reference}
                onChange={(e) => onInvoiceDataChange(invoiceData.id, { reference: e.target.value })}
                className="flex items-center w-full h-8 px-2 py-1.5 rounded-md bg-transparent text-sm font-normal text-[#0B2642] tracking-[-0.14px] outline-none border-0"
              />
            </div>
            <DateSelect
              label="Issue date"
              value={invoiceData.issueDate}
              onChange={(value) => onInvoiceDataChange(invoiceData.id, { issueDate: value })}
            />
            <DateSelect
              label="Due date"
              value={invoiceData.dueDate}
              onChange={(value) => onInvoiceDataChange(invoiceData.id, { dueDate: value })}
            />
          </div>

          {/* Row 2: Bank Account, Currency */}
          <div className="flex gap-4">
            <BankAccountSelect
              value={invoiceData.bankAccount}
              onChange={(value) => onInvoiceDataChange(invoiceData.id, { bankAccount: value })}
            />
            <CurrencySelect
              value={invoiceData.currency}
              onChange={(value) => onInvoiceDataChange(invoiceData.id, { currency: value })}
            />
          </div>

          {/* Upload Attachments */}
          <AttachmentUploader
            attachments={invoiceData.attachments}
            onAttachmentsChange={(attachments) => onInvoiceDataChange(invoiceData.id, { attachments })}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgba(26,28,46,0.12)] mx-6" />

      {/* Job Details Section */}
      <div className="px-6 py-6 space-y-6">
        <h3 className="text-base font-medium text-[#0B2642] tracking-[-0.16px]">Job Details</h3>
        
        {/* Render based on level of detail */}
        <div key={`job-details-${invoiceData.levelOfDetail}`}>
          {invoiceData.levelOfDetail === "summary" && (
            <SummaryJobView jobs={invoiceData.jobs} totalValue={totalValue} />
          )}
          
          {invoiceData.levelOfDetail === "detailed" && (
            <DetailedJobView 
              lineItems={lineItems}
              onLineItemToggle={onLineItemToggle}
              onSelectAll={onSelectAllLineItems}
              allSelected={allLineItemsSelected}
            />
          )}
          
          {invoiceData.levelOfDetail === "partial" && (
            <div className="space-y-6">
              {Object.entries(jobsByCategory).map(([category, jobs]) => {
                if (jobs.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-2">
                    <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">{category}</p>
                    {jobs.map(job => {
                      if (job.isGroupJob && job.childJobs) {
                        return (
                          <GroupJobCard
                            key={job.id}
                            groupJob={job}
                            childJobs={job.childJobs}
                            selectedChildIds={selectedJobIds}
                            onChildSelectionChange={onJobSelectionChange}
                            groupLinesSelected={selectedGroupLines.has(job.id)}
                            onGroupLinesSelectionChange={(checked) => onGroupLinesSelectionChange(job.id, checked as boolean)}
                          />
                        );
                      }
                      return <JobCard key={job.id} job={job} />;
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Totals Section - Only show if multiple invoices */}
      {totalInvoiceCount > 1 && (
        <div className="bg-[#F8F9FC] border-t border-[rgba(26,28,46,0.12)] px-6 py-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#555D66] tracking-[-0.14px]">Subtotal</span>
              <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(cardSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#555D66] tracking-[-0.14px]">VAT (Rate)</span>
              <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(cardVat)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[rgba(16,25,41,0.1)]">
              <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">Total</span>
              <span className="text-lg font-bold text-[#0B2642] tracking-[-0.18px]">{formatCurrency(cardTotal)}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onPreview}
            >
              Preview invoice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Universal Settings Panel
function UniversalSettingsPanel({ 
  levelOfDetail,
  onLevelOfDetailChange,
  breakdownLevel,
  onBreakdownChange,
  department,
  nominalCode,
  onDepartmentChange,
  onNominalCodeChange,
}: { 
  levelOfDetail: LevelOfDetail;
  onLevelOfDetailChange: (value: LevelOfDetail) => void;
  breakdownLevel: BreakdownLevel;
  onBreakdownChange: () => void;
  department: string;
  nominalCode: string;
  onDepartmentChange: (value: string) => void;
  onNominalCodeChange: (value: string) => void;
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

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08),0px_1px_2px_-1px_rgba(11,38,66,0.08),0px_2px_4px_0px_rgba(11,38,66,0.04)] overflow-hidden">
      <div className="px-5 pt-5 pb-5 space-y-5">
        <h3 className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">Universal Settings</h3>
        
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
        
        <div className="flex items-center justify-between pt-1">
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
  );
}

// Overview Panel
function OverviewPanel({ 
  subtotal,
  vatAmount,
  total,
  invoiceCount,
  onPreview,
}: { 
  subtotal: number;
  vatAmount: number;
  total: number;
  invoiceCount: number;
  onPreview?: () => void;
}) {
  const isSingleInvoice = invoiceCount === 1;
  
  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#0B2642] tracking-[-0.16px]">Overview</h3>
            <p className="text-sm font-medium text-[#73777D] tracking-[-0.14px]">
              Invoice - 1234
            </p>
          </div>
          <div className="flex items-center gap-1">
            <DraftBadge />
            <button className="p-0.5 hover:bg-gray-100 rounded">
              <MoreVertical className="h-5 w-5 text-[#0B2642]" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Totals */}
      <div className="bg-[#F8F9FC] border-t border-[rgba(26,28,46,0.12)] px-5 py-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#555D66] tracking-[-0.14px]">Subtotal</span>
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#555D66] tracking-[-0.14px]">VAT (Rate)</span>
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">{formatCurrency(vatAmount)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(16,25,41,0.1)]">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px]">{isSingleInvoice ? "Total" : "Group Total"}</span>
            <span className="text-xl font-bold text-[#0B2642] tracking-[-0.2px]">{formatCurrency(total)}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="default" 
            size="default" 
            className="w-full"
            onClick={onPreview}
          >
            Preview invoice
          </Button>
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
  
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    const uniqueParents = [...new Set(selectedJobs.map(j => j.parent))];
    uniqueParents.forEach((_, groupIndex) => {
      ids.add(`${groupIndex}-group-child-1`);
      ids.add(`${groupIndex}-group-child-2`);
    });
    return ids;
  });

  // Line items state for detailed view
  const [lineItems, setLineItems] = useState<LineItem[]>(mockLineItems);
  
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

  const handleLineItemToggle = useCallback((id: string) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  }, []);

  const handleSelectAllLineItems = useCallback(() => {
    const allSelected = lineItems.every(item => item.selected);
    setLineItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
  }, [lineItems]);

  const handleGroupLinesSelectionChange = useCallback((groupJobId: string, checked: boolean) => {
    const newSelected = new Set(selectedGroupLines);
    if (checked) {
      newSelected.add(groupJobId);
    } else {
      newSelected.delete(groupJobId);
    }
    setSelectedGroupLines(newSelected);
  }, [selectedGroupLines]);

  // Calculate totals dynamically based on level of detail and selections
  const summary = useMemo(() => {
    let subtotal = 0;
    
    invoiceCards.forEach(card => {
      const levelOfDetail = card.levelOfDetail;
      
      if (levelOfDetail === "detailed") {
        // For detailed view, sum selected line items
        lineItems.forEach(item => {
          if (item.selected) {
            subtotal += item.total;
          }
        });
      } else if (levelOfDetail === "summary") {
        // For summary view, include all jobs
        card.jobs.forEach(job => {
          if (job.isGroupJob && job.childJobs) {
            job.childJobs.forEach(child => {
              subtotal += child.leftToInvoice;
            });
            // Add group-level lines if selected
            if (selectedGroupLines.has(job.id)) {
              subtotal += job.leftToInvoice;
            }
          } else {
            subtotal += job.leftToInvoice;
          }
        });
      } else {
        // For partial view, sum based on selected jobs and group lines
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
            subtotal += job.leftToInvoice;
          }
        });
      }
    });
    
    const vatRate = 0.20; // 20% VAT
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  }, [invoiceCards, selectedJobIds, selectedGroupLines, lineItems]);

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
                  universalLevelOfDetail={universalLevelOfDetail}
                  lineItems={lineItems}
                  onLineItemToggle={handleLineItemToggle}
                  onSelectAllLineItems={handleSelectAllLineItems}
                  totalInvoiceCount={invoiceCards.length}
                  onPreview={() => handlePreviewInvoice(invoiceData.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Settings & Overview (Sticky) */}
          <div ref={rightColRef} className="w-[380px] shrink-0 self-start">
            <div className="sticky top-[77px] h-fit z-10 space-y-4 text-left">
              <UniversalSettingsPanel
                levelOfDetail={universalLevelOfDetail}
                onLevelOfDetailChange={handleUniversalLevelOfDetailChange}
                breakdownLevel={universalStructure}
                onBreakdownChange={handleBreakdownChange}
                department={department}
                nominalCode={nominalCode}
                onDepartmentChange={setDepartment}
                onNominalCodeChange={setNominalCode}
              />
              
              <OverviewPanel
                subtotal={summary.subtotal}
                vatAmount={summary.vatAmount}
                total={summary.total}
                invoiceCount={invoiceCards.length}
                onPreview={() => handlePreviewInvoice()}
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
