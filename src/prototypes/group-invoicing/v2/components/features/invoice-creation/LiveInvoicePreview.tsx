import { useMemo, useRef, useState } from "react";
import {
  Paperclip,
  FileText,
  X,
  Building2,
  ChevronDown,
  Pencil,
  Info,
  Download,
  Printer,
  ExternalLink,
} from "lucide-react";
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
}

// Jobs table component for the invoice preview
function JobsTable({
  jobs,
  selectedJobIds,
  levelOfDetail,
}: {
  jobs: JobWithLines[];
  selectedJobIds: Set<string>;
  levelOfDetail: "summary" | "partial" | "detailed";
}) {
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
            
            detailed.push(
              { id: `${child.id}-labour`, description: "Labour charges", quantity: 1, unitPrice: labourAmount, total: labourAmount, category: "labour", selected: true },
              { id: `${child.id}-materials`, description: "Materials and parts", quantity: 1, unitPrice: materialsAmount, total: materialsAmount, category: "materials", selected: true },
              { id: `${child.id}-other`, description: "Other charges", quantity: 1, unitPrice: otherAmount, total: otherAmount, category: "other", selected: true }
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
          
          detailed.push(
            { id: `${job.id}-labour`, description: "Labour charges", quantity: 1, unitPrice: labourAmount, total: labourAmount, category: "labour", selected: true },
            { id: `${job.id}-materials`, description: "Materials and parts", quantity: 1, unitPrice: materialsAmount, total: materialsAmount, category: "materials", selected: true },
            { id: `${job.id}-other`, description: "Other charges", quantity: 1, unitPrice: otherAmount, total: otherAmount, category: "other", selected: true }
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

  // SUMMARY VIEW - Single consolidated row
  if (levelOfDetail === "summary") {
    return (
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-3 h-10 pl-3 pr-4 bg-muted border-b border-hw-border">
          <div className="flex-1">
            <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
              Name
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

        {/* Single Summary Row */}
        <div className="flex items-center gap-3 min-h-[40px] max-h-[56px] pl-3 pr-4 bg-white">
          <div className="flex-1 flex items-center gap-2.5">
            <JobTypeDot category="blue" />
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              Overall work
            </span>
          </div>
          <div className="w-[100px] text-right">
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              {formatCurrency(overallTotal)}
            </span>
          </div>
          <div className="w-[100px] text-right">
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              {formatCurrency(overallTotal)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // DETAILED VIEW - Line items without checkboxes (selection via Edit Jobs button)
  if (levelOfDetail === "detailed") {
    return (
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-5 h-10 pl-3 pr-4 bg-muted border-b border-hw-border">
          <div className="flex-1">
            <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
              Name
            </span>
          </div>
          <div className="w-[100px]" />
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

        {/* Detailed Rows */}
        {detailedRows.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-5 min-h-[40px] max-h-[56px] pl-3 pr-4 bg-white"
          >
            <div className="flex-1 flex items-center gap-2.5">
              <JobTypeDot category={getLineItemColor(row.category)} />
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                {row.description}
              </span>
            </div>
            <div className="w-[100px]" />
            <div className="w-[100px] text-right">
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                {formatCurrency(row.unitPrice)}
              </span>
            </div>
            <div className="w-[100px] text-right">
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                {formatCurrency(row.total)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // PARTIAL VIEW (default) - One row per job
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center gap-3 h-10 pl-3 pr-4 bg-muted border-b border-hw-border">
        <div className="flex-1">
          <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
            Name
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

      {/* Partial Rows - One per job */}
      {partialRows.map((row) => (
        <div
          key={row.id}
          className="flex items-center gap-3 min-h-[40px] max-h-[56px] pl-3 pr-4 bg-white"
        >
          <div className="flex-1 flex items-center gap-2.5">
            <JobTypeDot category={getCategoryColor(row.categoryIndex)} />
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              {row.jobRef}
            </span>
          </div>
          <div className="w-[100px] text-right">
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              {formatCurrency(row.unitPrice)}
            </span>
          </div>
          <div className="w-[100px] text-right">
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
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

  // Handle saving changes from the Edit Jobs modal
  const handleEditJobsSave = (selectedJobIds: Set<string>, levelOfDetail: LevelOfDetail) => {
    onUpdateInvoice({
      selectedJobIds,
      levelOfDetail,
      isOverridden: true,
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
    <div className="flex-1 bg-muted overflow-auto">
      <div className="p-8 flex flex-col items-center gap-4">
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
          <div className="flex items-center gap-6">
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
                <Button
                  size="sm"
                  className="rounded-l-none border-l border-white/20 px-1"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Document */}
        <div className="w-full max-w-[900px] bg-white shadow-modal">
          <div className="p-6 flex flex-col gap-6">
            {/* Logo Section - only visible when enabled in settings */}
            {universalSettings.showLogo && (
              <LogoUploader
                logo={invoice.logo}
                onLogoChange={(logo) => onUpdateInvoice({ logo })}
              />
            )}

            {/* Top Section - From and Dates */}
            <div className="flex items-start justify-between">
              {/* From Section */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                  From:
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-hw-text tracking-[-0.14px] leading-5">
                    BigChange Ltd
                  </span>
                  <span className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px] leading-4">
                    123 Business Street
                  </span>
                </div>
              </div>

              {/* Right side - Dates and References - Editable */}
              <div className="flex flex-col gap-4">
                {/* First row: Issue date & Due date */}
                <div className="flex gap-6 justify-end">
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
                <div className="flex gap-6 justify-end">
                  <div className="flex flex-col gap-1 text-right w-[98px]">
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
            <div className="flex flex-col gap-2 max-w-[400px]">
              <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                Bill To:
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                  Boots Pharmacy
                </span>
                <span className="text-sm font-normal text-hw-text tracking-[-0.14px] leading-5">
                  {invoice.address}
                </span>
              </div>
            </div>

            {/* Invoice Title - Editable */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-hw-text-secondary tracking-[-0.14px] leading-5">
                Invoice title
              </span>
              <div className="inline-flex items-center h-8 px-2.5 py-1.5 bg-white shadow-input w-fit rounded-input">
                <input
                  type="text"
                  value={invoice.title || ""}
                  onChange={(e) => onUpdateInvoice({ title: e.target.value })}
                  placeholder="Fire extinguisher service"
                  className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5 bg-transparent border-none outline-none placeholder:text-hw-text-secondary/40"
                />
              </div>
            </div>

            {/* Jobs Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-hw-text tracking-[-0.16px] leading-6">
                  Jobs
                </span>
                <button
                  onClick={() => setEditJobsModalOpen(true)}
                  className="flex items-center gap-1 px-1 py-1 rounded-button bg-white shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08)] hover:shadow-[0px_0px_0px_1px_rgba(11,38,66,0.16)] transition-shadow"
                >
                  <Pencil className="h-3.5 w-3.5 text-hw-text" />
                  <span className="text-xs font-medium text-hw-text tracking-[-0.12px] leading-4 px-0.5">
                    Edit jobs
                  </span>
                </button>
              </div>
              <JobsTable
                jobs={invoice.jobs}
                selectedJobIds={invoice.selectedJobIds}
                levelOfDetail={invoice.levelOfDetail}
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
                  <label className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
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
              <div className="flex flex-col flex-1 min-w-[280px] max-w-[400px] h-[152px] rounded-card overflow-hidden">
                {/* Breakdown */}
                <div className="flex flex-col gap-3 pt-2 pb-3 box-content">
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

                {/* Total */}
                <div className="flex items-center justify-between py-2.5 border-t border-hw-border">
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    Total
                  </span>
                  <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Amount Due */}
                <div className="flex items-center justify-between py-3 border-t border-hw-border">
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
            {universalSettings.showTcs && (
              <>
                <div className="h-px bg-hw-border" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                    Terms & Conditions
                  </label>
                  <div className="p-3 bg-hw-surface-subtle rounded-card border border-hw-border">
                    <p className="text-xs text-hw-text-secondary tracking-[-0.12px] leading-4">
                      Payment is due within 30 days of the invoice date. Late payments may be subject to interest charges at the rate of 2% per month. All goods remain the property of the seller until payment is received in full. Any disputes must be raised within 14 days of receipt of this invoice.
                    </p>
                  </div>
                </div>
              </>
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
        onSave={handleEditJobsSave}
      />
    </div>
  );
}
