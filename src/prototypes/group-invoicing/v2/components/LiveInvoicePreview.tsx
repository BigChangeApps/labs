import { useMemo, useRef } from "react";
import {
  Paperclip,
  FileText,
  X,
  Building2,
  Calendar as CalendarIcon,
  ChevronDown,
  Layers,
  Pencil,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import { Textarea } from "@/registry/ui/textarea";
import { Calendar } from "@/registry/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { cn } from "@/registry/lib/utils";
import { formatCurrency } from "../lib/mock-data";
import type {
  InvoiceData,
  JobWithLines,
  Attachment,
  UniversalSettings,
} from "./UnifiedInvoiceWorkspace";

interface LiveInvoicePreviewProps {
  invoice: InvoiceData;
  onUpdateInvoice: (updates: Partial<InvoiceData>) => void;
  universalSettings: UniversalSettings;
  onSendInvoice: () => void;
  isSent: boolean;
}

// Date picker input component
function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const dateValue = value ? new Date(value) : undefined;
  const displayValue = dateValue ? format(dateValue, "dd/MM/yyyy") : "";

  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between gap-1.5 h-8 pl-2 pr-1.5 bg-white rounded-md shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:shadow-[0px_0px_0px_1px_rgba(8,109,255,0.4)] transition-shadow">
            <span
              className={cn(
                "text-sm tracking-[-0.14px]",
                displayValue ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)]"
              )}
            >
              {displayValue || placeholder}
            </span>
            <CalendarIcon className="h-5 w-5 text-[#0B2642]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Text input field component
function TextInputField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
        {label}
      </label>
      <div className="flex items-center h-8 px-2.5 bg-white shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm font-medium text-[#0B2642] tracking-[-0.14px] bg-transparent border-none outline-none placeholder:text-[rgba(11,38,66,0.4)]"
        />
      </div>
    </div>
  );
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
        <div className="relative w-[160px] h-[68px] rounded-sm border border-[rgba(26,28,46,0.12)] overflow-hidden group">
          <img
            src={logo}
            alt="Invoice logo"
            className="w-full h-full object-contain bg-white"
          />
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-[#73777D]" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-[160px] h-[68px] flex items-center justify-center rounded-sm bg-[#F8F9FC] border border-[rgba(26,28,46,0.12)] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px]">Add logo</span>
        </button>
      )}
    </div>
  );
}

// Resource avatar component
function ResourceAvatar({ initials = "LB" }: { initials?: string }) {
  return (
    <div className="relative size-[18px]">
      <div className="absolute inset-0 rounded-full bg-white shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.45px_1.8px_0px_rgba(11,38,66,0.16)] overflow-hidden">
        <div className="absolute inset-[5%] rounded-full bg-[#F8F9FC] flex items-center justify-center">
          <span className="text-[8px] font-semibold text-[#73777D] leading-none">
            {initials}
          </span>
        </div>
      </div>
    </div>
  );
}

// Job card component (for standalone jobs)
function JobCard({
  job,
  isSelected,
  onToggle,
}: {
  job: JobWithLines;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 h-[70px] pl-4 pr-3 py-3 bg-white border border-[rgba(26,28,46,0.12)] rounded-lg hover:border-[rgba(26,28,46,0.24)] transition-colors">
      <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px] leading-5">
            {job.jobRef}
          </span>
          <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
            {job.completed}
          </span>
          <ResourceAvatar
            initials={job.jobCategory === "Internal" ? "CS" : "LB"}
          />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center px-1.5 py-px h-5 rounded-md border",
              isSelected
                ? "bg-[rgba(8,109,255,0.08)] border-[rgba(2,136,209,0.2)]"
                : "bg-[rgba(26,28,46,0.05)] border-[rgba(26,28,46,0.12)]"
            )}
          >
            <span
              className={cn(
                "text-sm font-medium tracking-[-0.14px] leading-5",
                isSelected ? "text-[#0288D1]" : "text-[#73777D]"
              )}
            >
              {job.linesCount} lines
            </span>
          </div>
          {job.jobCategory !== "External, Internal" && (
            <div className="inline-flex items-center px-1.5 py-px h-5 rounded-md bg-white border border-[rgba(26,28,46,0.12)]">
              <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
                {job.jobCategory}
              </span>
            </div>
          )}
        </div>
      </div>
      <span
        className={cn(
          "text-sm tracking-[-0.14px] leading-5",
          isSelected ? "font-bold text-[#0B2642]" : "font-medium text-[rgba(11,38,66,0.4)]"
        )}
      >
        {formatCurrency(job.leftToInvoice)}
      </span>
    </div>
  );
}

// Nested job card (inside group jobs)
function NestedJobCard({
  job,
  isSelected,
  onToggle,
}: {
  job: JobWithLines;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 h-[70px] pl-4 pr-3 py-3 bg-white border border-[rgba(26,28,46,0.12)] rounded-lg">
      <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px] leading-5">
            {job.jobRef}
          </span>
          <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
            {job.completed}
          </span>
          <ResourceAvatar
            initials={job.jobCategory === "Internal" ? "CS" : "LB"}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "inline-flex items-center px-1.5 py-px h-5 rounded-md border",
              isSelected
                ? "bg-[rgba(8,109,255,0.08)] border-[rgba(2,136,209,0.2)]"
                : "bg-[rgba(26,28,46,0.05)] border-[rgba(26,28,46,0.12)]"
            )}
          >
            <span
              className={cn(
                "text-sm font-medium tracking-[-0.14px] leading-5",
                isSelected ? "text-[#0288D1]" : "text-[#73777D]"
              )}
            >
              {job.linesCount} lines
            </span>
          </div>
        </div>
      </div>
      <span
        className={cn(
          "text-sm tracking-[-0.14px] leading-5",
          isSelected ? "font-bold text-[#0B2642]" : "font-medium text-[rgba(11,38,66,0.4)]"
        )}
      >
        {formatCurrency(job.leftToInvoice)}
      </span>
    </div>
  );
}

// Group job card component
function GroupJobCard({
  job,
  selectedJobIds,
  onToggleChild,
}: {
  job: JobWithLines;
  selectedJobIds: Set<string>;
  onToggleChild: (childId: string) => void;
}) {
  // Calculate group total based on selected children
  const groupTotal = job.childJobs?.reduce((total, child) => {
    if (selectedJobIds.has(child.id)) {
      return total + child.leftToInvoice;
    }
    return total;
  }, 0) || 0;

  return (
    <div className="bg-white border border-[rgba(26,28,46,0.12)] rounded-lg overflow-hidden">
      {/* Group Header */}
      <div className="flex items-center gap-2 p-3 bg-[#F8F9FC] border-b border-[rgba(26,28,46,0.12)]">
        <Layers className="h-5 w-5 text-[#73777D]" />
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px] leading-5">
              {job.jobRef}
            </span>
            <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
              {job.completed}
            </span>
          </div>
          <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px] leading-5">
            {formatCurrency(groupTotal > 0 ? groupTotal : job.leftToInvoice)}
          </span>
        </div>
      </div>
      
      {/* Child Jobs */}
      <div className="p-4 flex flex-col gap-3">
        {job.childJobs?.map((child) => (
          <NestedJobCard
            key={child.id}
            job={child}
            isSelected={selectedJobIds.has(child.id)}
            onToggle={() => onToggleChild(child.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Category dot for job type in table
function JobTypeDot({ category }: { category: "blue" | "orange" | "purple" }) {
  const colors = {
    blue: "bg-[#0E94EB]",
    orange: "bg-[#FE8640]",
    purple: "bg-[#8C54CA]",
  };
  return <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", colors[category])} />;
}

// Jobs table component for the invoice preview
function JobsTable({
  jobs,
  selectedJobIds,
}: {
  jobs: JobWithLines[];
  selectedJobIds: Set<string>;
}) {
  // Generate table rows from jobs - only show selected jobs
  const tableRows = useMemo(() => {
    const rows: { id: string; jobRef: string; unitPrice: number; total: number; categoryIndex: number }[] = [];
    let categoryIndex = 0;
    
    jobs.forEach((job) => {
      if (job.isGroupJob && job.childJobs) {
        job.childJobs.forEach((child) => {
          if (selectedJobIds.has(child.id)) {
            rows.push({
              id: child.id,
              jobRef: child.jobRef,
              unitPrice: child.leftToInvoice / (child.linesCount || 1),
              total: child.leftToInvoice,
              categoryIndex: categoryIndex % 3,
            });
            categoryIndex++;
          }
        });
      } else {
        if (selectedJobIds.has(job.id)) {
          rows.push({
            id: job.id,
            jobRef: job.jobRef,
            unitPrice: job.leftToInvoice / (job.linesCount || 1),
            total: job.leftToInvoice,
            categoryIndex: categoryIndex % 3,
          });
          categoryIndex++;
        }
      }
    });
    
    return rows;
  }, [jobs, selectedJobIds]);

  const getCategoryColor = (index: number): "blue" | "orange" | "purple" => {
    const colors: Array<"blue" | "orange" | "purple"> = ["blue", "orange", "purple"];
    return colors[index % 3];
  };

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center gap-3 h-10 pl-3 pr-4 bg-[#FCFCFD] border-b border-[rgba(16,25,41,0.1)]">
        <div className="flex-1 flex items-center gap-5">
          <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
            Name
          </span>
        </div>
        <div className="w-[100px] text-right">
          <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
            Unit price
          </span>
        </div>
        <div className="w-[100px] text-right">
          <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
            Total
          </span>
        </div>
      </div>

      {/* Table Body */}
      {tableRows.map((row) => (
        <div
          key={row.id}
          className="flex items-center gap-3 min-h-[40px] max-h-[56px] pl-3 pr-4 bg-white"
        >
          <div className="flex-1 flex items-center gap-2.5">
            <JobTypeDot category={getCategoryColor(row.categoryIndex)} />
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
              {row.jobRef}
            </span>
          </div>
          <div className="w-[100px] text-right">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
              {formatCurrency(row.unitPrice)}
            </span>
          </div>
          <div className="w-[100px] text-right">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
              {formatCurrency(row.total)}
            </span>
          </div>
        </div>
      ))}
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
    <div className="flex items-center justify-between px-3 py-2 bg-[#F8F9FC] rounded-md group">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-4 w-4 text-[#73777D] shrink-0" />
        <span className="text-sm text-[#0B2642] truncate">{attachment.name}</span>
        <span className="text-xs text-[#73777D] shrink-0">
          ({formatFileSize(attachment.size)})
        </span>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-[rgba(11,38,66,0.08)] rounded transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="h-4 w-4 text-[#73777D]" />
      </button>
    </div>
  );
}

export function LiveInvoicePreview({
  invoice,
  onUpdateInvoice,
  onSendInvoice,
  isSent,
}: LiveInvoicePreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Toggle job selection
  const toggleJob = (jobId: string) => {
    const newSelected = new Set(invoice.selectedJobIds);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    onUpdateInvoice({ selectedJobIds: newSelected, isOverridden: true });
  };

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
    <div className="flex-1 bg-[#F9FAFD] overflow-auto">
      <div className="p-8 flex flex-col items-center gap-4">
        {/* Sent Invoice Banner */}
        {isSent && (
          <div className="w-full max-w-[900px] flex items-start gap-3 p-4 bg-[#0288D1] rounded-lg">
            <Info className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-white tracking-[-0.14px]">
                Invoice sent
              </span>
              <span className="text-sm text-white/90 tracking-[-0.14px]">
                This invoice was sent to the customer on {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'x date'}
              </span>
            </div>
          </div>
        )}

        {/* Header Row - Title and Quick Actions */}
        <div className="w-full max-w-[900px] flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Building2 className="h-4 w-4 text-[#73777D]" />
            <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px]">
              John Lewis Leeds ({selectedJobCount} Jobs) - {formatCurrency(total)}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {/* Actions dropdown */}
            <Button variant="secondary" size="sm" className="gap-1">
              <ChevronDown className="h-4 w-4" />
              Actions
            </Button>
            
            {/* Send Invoice split button */}
            <div className="flex items-stretch rounded-md shadow-[0_0_0_1px_rgba(7,98,229,0.8)] overflow-hidden">
              <button
                onClick={onSendInvoice}
                disabled={isSent}
                className="flex items-center gap-1 px-1 py-1.5 bg-[#086DFF] hover:bg-[#0752cc] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="px-0.5">Send invoice</span>
              </button>
              <button
                className="flex items-center justify-center px-0.5 bg-[#086DFF] hover:bg-[#0752cc] border-l border-[#1a1c2e] transition-colors"
              >
                <ChevronDown className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="w-full max-w-[900px] bg-white shadow-[0px_0px_0px_1px_rgba(26,28,46,0.08),0px_16px_32px_0px_rgba(26,28,46,0.08),0px_2px_24px_0px_rgba(26,28,46,0.08)]">
          <div className="p-6 flex flex-col gap-6">
            {/* Logo Section */}
            <LogoUploader
              logo={invoice.logo}
              onLogoChange={(logo) => onUpdateInvoice({ logo })}
            />

            {/* Top Section - From and Dates */}
            <div className="flex items-start justify-between">
              {/* From Section */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
                  From:
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-[#0B2642] tracking-[-0.14px] leading-5">
                    BigChange Ltd
                  </span>
                  <span className="text-xs font-normal text-[#62748E] tracking-[-0.12px] leading-4">
                    123 Business Street
                  </span>
                </div>
              </div>

              {/* Right side - Dates and References - Editable */}
              <div className="flex flex-col gap-4">
                {/* First row: Issue date & Due date */}
                <div className="flex gap-6 justify-end">
                  <div className="flex flex-col gap-1 text-right w-[98px]">
                    <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] leading-4">
                      Issue date:
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button 
                          type="button"
                          className={cn(
                            "text-sm tracking-[-0.14px] leading-5 hover:underline cursor-pointer text-right",
                            invoice.issueDate ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)]"
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
                    <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] leading-4">
                      Due date:
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button 
                          type="button"
                          className={cn(
                            "text-sm tracking-[-0.14px] leading-5 hover:underline cursor-pointer text-right",
                            invoice.dueDate ? "text-[#0B2642]" : "text-[rgba(11,38,66,0.4)]"
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
                <div className="flex gap-6 justify-end">
                  <div className="flex flex-col gap-1 text-right w-[98px]">
                    <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] leading-4">
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
                      className="text-sm text-[#0B2642] tracking-[-0.14px] leading-5 text-right bg-transparent border-none outline-none hover:underline focus:underline"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-right w-[66px]">
                    <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] leading-4">
                      Reference:
                    </span>
                    <input
                      type="text"
                      value={invoice.reference || ""}
                      onChange={(e) => onUpdateInvoice({ reference: e.target.value })}
                      placeholder="243452"
                      className="text-sm text-[#0B2642] tracking-[-0.14px] leading-5 text-right bg-transparent border-none outline-none hover:underline focus:underline placeholder:text-[rgba(11,38,66,0.4)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="flex flex-col gap-2 max-w-[400px]">
              <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
                Bill To:
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                  Boots Pharmacy
                </span>
                <span className="text-sm font-normal text-[#0B2642] tracking-[-0.14px] leading-5">
                  {invoice.address}
                </span>
              </div>
            </div>

            {/* Invoice Title - Editable */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#73777D] tracking-[-0.14px] leading-5">
                Invoice title
              </span>
              <div className="inline-flex items-center h-8 px-2.5 py-1.5 bg-white shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] w-fit rounded-md">
                <input
                  type="text"
                  value={invoice.title || ""}
                  onChange={(e) => onUpdateInvoice({ title: e.target.value })}
                  placeholder="Fire extinguisher service"
                  className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5 bg-transparent border-none outline-none placeholder:text-[rgba(11,38,66,0.4)]"
                />
              </div>
            </div>

            {/* Jobs Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-[#0B2642] tracking-[-0.16px] leading-6">
                  Jobs
                </span>
                <button className="flex items-center gap-1 px-1 py-1 rounded-md bg-white shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08)] hover:shadow-[0px_0px_0px_1px_rgba(11,38,66,0.16)] transition-shadow">
                  <Pencil className="h-3.5 w-3.5 text-[#0A0A0A]" />
                  <span className="text-xs font-medium text-[#0B2642] tracking-[-0.12px] leading-4 px-0.5">
                    Edit jobs
                  </span>
                </button>
              </div>
              <JobsTable
                jobs={invoice.jobs}
                selectedJobIds={invoice.selectedJobIds}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border" style={{ backgroundClip: 'border-box', WebkitBackgroundClip: 'border-box', color: 'rgba(20, 20, 20, 1)' }} />

            {/* Notes and Totals Row - Side by Side */}
            <div className="flex gap-10 items-start">
              {/* Left: Notes and Upload */}
              <div className="flex flex-col gap-6 flex-1 min-w-[250px]">
                {/* Notes Section */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                    Notes
                  </label>
                  <Textarea
                    value={invoice.notes}
                    onChange={(e) => onUpdateInvoice({ notes: e.target.value })}
                    placeholder=""
                    className="min-h-[66px] resize-y shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] border-none"
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
              <div className="flex flex-col flex-1 min-w-[280px] max-w-[400px] h-[152px] rounded-md overflow-hidden">
                {/* Breakdown */}
                <div className="flex flex-col gap-3 pt-2 pb-3 border-t border-[rgba(16,25,41,0.1)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                      Subtotal
                    </span>
                    <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                      VAT (Rate)
                    </span>
                    <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                      {formatCurrency(vatAmount)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-2.5 border-t border-[rgba(16,25,41,0.1)]">
                  <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                    Total
                  </span>
                  <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Amount Due */}
                <div className="flex items-center justify-between py-3 border-t border-[rgba(16,25,41,0.1)]">
                  <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                    Amount due
                  </span>
                  <span className="text-xl font-bold text-[#0B2642] tracking-[-0.2px] leading-6">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
