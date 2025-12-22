import { FileText, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import { cn } from "@/registry/lib/utils";
import { formatCurrency } from "../../../lib/mock-data";
import type { InvoiceData } from "../../pages/UnifiedInvoiceWorkspace";

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
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full h-auto text-left p-4 rounded-card transition-all flex flex-col items-stretch gap-4",
        "shadow-card",
        isActive
          ? "bg-hw-brand/8 border border-hw-brand"
          : "bg-white border border-transparent hover:shadow-[0px_0px_0px_1px_rgba(26,28,46,0.16),0px_2px_4px_0px_rgba(26,28,46,0.08)]"
      )}
    >
      {/* Status badge at top */}
      <Badge
        variant={isSent ? "default" : "secondary"}
        className={cn(
          "self-start",
          isSent && "bg-green-500 hover:bg-green-500 text-white"
        )}
      >
        {isSent ? "Sent" : "Draft"}
      </Badge>

      {/* Content container */}
      <div className="flex flex-col gap-[13px] w-full">
        {/* Header row: Icon, Name, and Amount */}
        <div className="flex items-center gap-[13px] px-2">
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <Building2 className={cn("h-4 w-4 shrink-0", isSent ? "text-hw-text-secondary" : "text-hw-text")} />
            <span className={cn(
              "text-base font-bold tracking-[-0.16px] truncate leading-6",
              isSent ? "text-hw-text-secondary" : "text-hw-text"
            )}>
              {invoice.name}
            </span>
          </div>
          <span className={cn(
            "text-sm font-bold tracking-[-0.14px] leading-5 shrink-0",
            isSent ? "text-hw-text-secondary" : "text-hw-text"
          )}>
            {formatCurrency(total)}
          </span>
        </div>

        {/* Details section */}
        <div className="flex flex-col gap-2 px-2">
          <p className="text-sm font-normal text-hw-text-secondary tracking-[-0.14px] leading-5">
            Reference: {invoice.reference || invoice.invoiceNumber}
          </p>

          {/* Jobs badge */}
          <Badge variant="secondary" className="self-start bg-hw-brand/8 text-hw-brand border-hw-brand/20">
            {selected}/{totalJobs} Jobs
          </Badge>
        </div>
      </div>
    </Button>
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
    <div className="w-[400px] min-w-[350px] max-w-[500px] shrink-0 bg-white border-r border-hw-border overflow-auto">
      <div className="p-8 flex flex-col gap-6">
        {/* Back Link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackClick}
          className="self-start gap-2 text-hw-text-secondary hover:text-hw-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoice list
        </Button>

        {/* Header with icon */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-hw-text" />
            <h2 className="text-base font-medium text-hw-text tracking-[-0.16px] leading-6">
              Invoices ({invoices.length})
            </h2>
          </div>
          <p className="text-xs font-normal text-hw-text-secondary tracking-[-0.12px] leading-4">
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
