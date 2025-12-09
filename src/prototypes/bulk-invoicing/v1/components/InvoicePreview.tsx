import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Paperclip, FileText } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Textarea } from "@/registry/ui/textarea";
import { formatCurrency } from "../lib/mock-data";
import { markJobsAsInvoiced } from "../lib/invoice-utils";

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
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

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
}

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
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Attachment Uploader Component
function AttachmentUploader({
  attachments,
  onAttachmentsChange,
}: {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}) {
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
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="attachment-upload"
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
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => document.getElementById("attachment-upload")?.click()}
      >
        <Paperclip className="h-4 w-4" />
        Upload attachments
      </Button>
    </div>
  );
}

export function InvoicePreview() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get invoice data from navigation state
  const locationState = (location.state || {}) as {
    invoiceData?: InvoiceData;
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
  };

  const [invoiceData, setInvoiceData] = useState<InvoiceData>(
    locationState.invoiceData || defaultInvoiceData
  );

  // Generate line items
  const lineItems = useMemo(
    () => generateLineItems(invoiceData.jobs),
    [invoiceData.jobs]
  );

  // Group line items by job
  const lineItemsByJob = useMemo(() => {
    const grouped: Record<string, LineItem[]> = {};
    lineItems.forEach((item) => {
      if (!grouped[item.jobRef]) {
        grouped[item.jobRef] = [];
      }
      grouped[item.jobRef].push(item);
    });
    return grouped;
  }, [lineItems]);

  // Calculate totals
  const { subtotal, total } = useMemo(() => {
    const sub = lineItems.reduce((sum, item) => sum + item.total, 0);
    return { subtotal: sub, total: sub };
  }, [lineItems]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleNext = () => {
    // Mark jobs as invoiced if originalJobIds are available
    if (invoiceData.originalJobIds && invoiceData.originalJobIds.length > 0) {
      markJobsAsInvoiced(invoiceData.originalJobIds);
    }
    
    // Navigate to send/confirm page or send the invoice
    navigate("/bulk-invoicing/v1", {
      state: {
        success: true,
        message: `Successfully sent invoice for ${formatCurrency(total)}`,
      },
    });
  };

  const updateInvoiceField = (field: keyof InvoiceData, value: string) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[rgba(26,28,46,0.12)]">
        <h1 className="text-lg font-bold text-[#0B2642]">
          Invoice {invoiceData.invoiceNumber}
        </h1>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-[#F8F9FC] rounded-md transition-colors"
        >
          <X className="h-5 w-5 text-[#0B2642]" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div className="w-[400px] border-r border-[rgba(26,28,46,0.12)] overflow-auto">
          <div className="p-8 space-y-6">
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

            {/* Reference */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Reference
              </label>
              <Input
                type="text"
                value={invoiceData.reference}
                onChange={(e) => updateInvoiceField("reference", e.target.value)}
                className="h-10"
                placeholder="Enter reference..."
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Issue Date
              </label>
              <Input
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => updateInvoiceField("issueDate", e.target.value)}
                className="h-10"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Due Date
              </label>
              <Input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => updateInvoiceField("dueDate", e.target.value)}
                className="h-10"
              />
            </div>

            {/* Bill To Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Bill To Name
              </label>
              <Input
                type="text"
                value={invoiceData.name}
                onChange={(e) => updateInvoiceField("name", e.target.value)}
                className="h-10"
                placeholder="Enter name..."
              />
            </div>

            {/* Bill To Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Bill To Address
              </label>
              <Textarea
                value={invoiceData.address}
                onChange={(e) => updateInvoiceField("address", e.target.value)}
                placeholder="Enter address..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Nominal code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Nominal code
              </label>
              <Input type="text" value="5001" className="h-10" readOnly />
            </div>

            {/* Department code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">
                Department code
              </label>
              <Input type="text" value="67800" className="h-10" readOnly />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0B2642]">Notes</label>
              <Textarea
                value={invoiceData.notes}
                onChange={(e) => updateInvoiceField("notes", e.target.value)}
                placeholder="Add notes..."
                className="min-h-[100px] resize-none"
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
                    Issue Date: {formatDisplayDate(invoiceData.issueDate)}
                  </p>
                  <p className="text-[#73777D]">
                    Due Date: {formatDisplayDate(invoiceData.dueDate)}
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

            {/* Line Items Table */}
            <div className="px-8 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(26,28,46,0.12)]">
                    <th className="text-left py-2 font-medium text-[#73777D]">
                      Description
                    </th>
                    <th className="text-right py-2 font-medium text-[#73777D] w-16">
                      Quantity
                    </th>
                    <th className="text-right py-2 font-medium text-[#73777D] w-20">
                      Unit Price
                    </th>
                    <th className="text-right py-2 font-medium text-[#73777D] w-20">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(lineItemsByJob).map(([jobRef, items]) => (
                    <>
                      {/* Job Header */}
                      <tr key={`header-${jobRef}`}>
                        <td
                          colSpan={4}
                          className="pt-4 pb-1 font-medium text-[#0B2642]"
                        >
                          {jobRef}
                          <span className="font-normal text-[#73777D] text-xs ml-2">
                            Completed:{" "}
                            {items[0]?.jobDate || ""}
                          </span>
                        </td>
                      </tr>
                      {/* Line Items */}
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[rgba(26,28,46,0.04)]"
                        >
                          <td className="py-2 pl-4 text-[#555D66]">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#086DFF] mr-2" />
                            {item.description}
                          </td>
                          <td className="py-2 text-right text-[#555D66]">
                            {item.quantity}
                          </td>
                          <td className="py-2 text-right text-[#555D66]">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-2 text-right font-medium text-[#0B2642]">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
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

      {/* Footer */}
      <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(26,28,46,0.12)] bg-white">
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
        <Button variant="default" onClick={handleNext}>
          Next
        </Button>
      </footer>
    </div>
  );
}

