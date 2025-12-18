import { FileText, Building2, ArrowLeft } from "lucide-react";
import { cn } from "@/registry/lib/utils";
import { formatCurrency } from "../lib/mock-data";
import type { InvoiceData } from "./UnifiedInvoiceWorkspace";

interface InvoiceCardListProps {
  invoices: InvoiceData[];
  activeInvoiceId: string;
  onSelectInvoice: (invoiceId: string) => void;
  sentInvoiceIds: Set<string>;
  onBackClick: () => void;
}

// Calculate invoice total based on selected jobs
function calculateInvoiceTotal(invoice: InvoiceData): number {
  let total = 0;

  invoice.jobs.forEach((job) => {
    if (job.isGroupJob && job.childJobs) {
      job.childJobs.forEach((child) => {
        if (invoice.selectedJobIds.has(child.id)) {
          total += child.leftToInvoice;
        }
      });
      if (invoice.selectedGroupLines.has(job.id)) {
        total += job.leftToInvoice;
      }
    } else {
      if (invoice.selectedJobIds.has(job.id)) {
        total += job.leftToInvoice;
      }
    }
  });

  return total;
}

// Count selected jobs and total jobs
function countJobs(invoice: InvoiceData): { selected: number; total: number } {
  let selected = 0;
  let total = 0;

  invoice.jobs.forEach((job) => {
    if (job.isGroupJob && job.childJobs) {
      job.childJobs.forEach((child) => {
        total++;
        if (invoice.selectedJobIds.has(child.id)) {
          selected++;
        }
      });
    } else {
      total++;
      if (invoice.selectedJobIds.has(job.id)) {
        selected++;
      }
    }
  });

  return { selected, total };
}

function InvoiceCard({
  invoice,
  isActive,
  isSent,
  onClick,
}: {
  invoice: InvoiceData;
  isActive: boolean;
  isSent: boolean;
  onClick: () => void;
}) {
  const total = calculateInvoiceTotal(invoice);
  const { selected, total: totalJobs } = countJobs(invoice);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg transition-all flex flex-col gap-4",
        "shadow-[0px_0px_0px_1px_rgba(26,28,46,0.12),0px_1px_2px_-1px_rgba(26,28,46,0.08),0px_2px_4px_0px_rgba(26,28,46,0.06)]",
        isActive
          ? "bg-[rgba(8,109,255,0.08)] border border-[#0165F6]"
          : "bg-white border border-transparent hover:shadow-[0px_0px_0px_1px_rgba(26,28,46,0.16),0px_2px_4px_0px_rgba(26,28,46,0.08)]"
      )}
    >
      {/* Status badge at top */}
      <div className={cn(
        "inline-flex items-center self-start px-1.5 py-0.5 rounded-full",
        isSent
          ? "bg-[#22C55E]"
          : "bg-white border border-[rgba(26,28,46,0.12)]"
      )}>
        <span className={cn(
          "text-xs font-medium tracking-[-0.12px] leading-4 px-0.5",
          isSent ? "text-white" : "text-[#0B2642]"
        )}>
          {isSent ? "Sent" : "Draft"}
        </span>
      </div>

      {/* Content container */}
      <div className="flex flex-col gap-[13px] w-full">
        {/* Header row: Icon, Name, and Amount */}
        <div className="flex items-center gap-[13px] px-2">
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <Building2 className={cn("h-4 w-4 shrink-0", isSent ? "text-[#73777D]" : "text-[#0B2642]")} />
            <span className={cn(
              "text-base font-bold tracking-[-0.16px] truncate leading-6",
              isSent ? "text-[#73777D]" : "text-[#0B2642]"
            )}>
              {invoice.name}
            </span>
          </div>
          <span className={cn(
            "text-sm font-bold tracking-[-0.14px] leading-5 shrink-0",
            isSent ? "text-[#73777D]" : "text-[#0B2642]"
          )}>
            {formatCurrency(total)}
          </span>
        </div>

        {/* Details section */}
        <div className="flex flex-col gap-2 px-2">
          <p className="text-sm font-normal text-[#73777D] tracking-[-0.14px] leading-5">
            Reference: {invoice.reference || invoice.invoiceNumber}
          </p>
          
          {/* Jobs badge */}
          <div className="inline-flex items-center self-start px-1.5 py-px h-5 rounded-md bg-[rgba(8,109,255,0.08)] border border-[rgba(2,136,209,0.2)]">
            <span className="text-sm font-medium text-[#0288D1] tracking-[-0.14px] leading-5">
              {selected}/{totalJobs} Jobs
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function InvoiceCardList({
  invoices,
  activeInvoiceId,
  onSelectInvoice,
  sentInvoiceIds,
  onBackClick,
}: InvoiceCardListProps) {
  return (
    <div className="w-[400px] min-w-[350px] max-w-[500px] shrink-0 bg-white border-r border-[rgba(26,28,46,0.12)] overflow-auto">
      <div className="p-8 flex flex-col gap-6">
        {/* Back Link */}
        <button
          onClick={onBackClick}
          className="flex items-center gap-2 text-sm font-medium text-[#475467] hover:text-[#0B2642] transition-colors self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoice list
        </button>

        {/* Header with icon */}
        <div className="flex flex-col gap-3 w-[180px]">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#0B2642]" />
            <h2 className="text-base font-medium text-[#0B2642] tracking-[-0.16px] leading-6">
              Invoices ({invoices.length})
            </h2>
          </div>
          <p className="text-xs font-normal text-[#73777D] tracking-[-0.12px] leading-4">
            Select an invoice to edit
          </p>
        </div>

        {/* Invoice Cards */}
        <div className="flex flex-col gap-6">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              isActive={invoice.id === activeInvoiceId}
              isSent={sentInvoiceIds.has(invoice.id)}
              onClick={() => onSelectInvoice(invoice.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
