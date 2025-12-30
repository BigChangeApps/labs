import { FileText, Building2, ArrowLeft, ChevronDown, Send, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Badge } from "@/registry/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/ui/dropdown-menu";
import { cn } from "@/registry/lib/utils";
import { formatCurrency } from "../../../lib/mock-data";
import type { InvoiceData } from "../../pages/UnifiedInvoiceWorkspace";

interface InvoiceCardListProps {
  invoices: InvoiceData[];
  activeInvoiceId: string;
  onSelectInvoice: (invoiceId: string) => void;
  sentInvoiceIds: Set<string>;
  onBackClick: () => void;
  totals: {
    subtotal: number;
    vatAmount: number;
    total: number;
  };
  invoiceCount: number;
  onSendAll: () => void;
  hasSentInvoices?: boolean;
  customerName?: string;
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
        "w-full h-auto text-left p-4 rounded-card transition-all flex flex-col items-stretch gap-4 ring-1 shadow-card bg-hw-surface ring-hw-border",
        isActive && "bg-hw-brand/16 ring-hw-brand"
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
          <Badge 
            variant="secondary" 
            className={cn(
              "self-start",
              isActive 
                ? "bg-hw-brand/8 text-hw-brand border-hw-brand/20" 
                : "bg-hw-surface-subtle border-hw-border text-hw-text-secondary"
            )}
          >
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
  totals,
  invoiceCount,
  onSendAll,
  hasSentInvoices = false,
  customerName = "Head Office",
}: InvoiceCardListProps) {
  const buttonText = hasSentInvoices
    ? "Send all remaining invoices"
    : `Send all ${invoiceCount} invoices`;

  return (
    <div className="w-[499px] min-w-[350px] max-w-[500px] shrink-0 bg-white border-r border-hw-border flex flex-col h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto p-8 flex flex-col gap-8">
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

      {/* Sticky footer with totals and CTA */}
      <div className="shrink-0 p-8 pt-0 flex flex-col gap-6">
        {/* Totals Section */}
        <div className="flex flex-col rounded-card overflow-hidden">
          {/* Breakdown rows */}
          <div className="flex flex-col gap-3 pt-3 pb-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                Subtotal
              </span>
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                VAT (Rate)
              </span>
              <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
                {formatCurrency(totals.vatAmount)}
              </span>
            </div>
          </div>

          {/* Amount due row */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <span className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5">
              Amount due
            </span>
            <span className="text-xl font-bold text-hw-text tracking-[-0.2px] leading-6">
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>

        {/* Send All CTA */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-stretch rounded-button overflow-hidden shadow-[0_0_0_1px_rgba(7,98,229,0.8)] w-full">
            <Button
              onClick={onSendAll}
              disabled={invoiceCount === 0}
              className="rounded-r-none flex-1"
            >
              {buttonText}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="rounded-l-none border-l border-white/20 px-1"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onSendAll} disabled={invoiceCount === 0}>
                  <Send className="h-4 w-4 mr-2" />
                  Send all invoices
                </DropdownMenuItem>
                <DropdownMenuItem disabled={invoiceCount === 0}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as sent
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  disabled={invoiceCount === 0}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs text-hw-text-secondary text-center tracking-[-0.12px] leading-4">
            {invoiceCount} {invoiceCount === 1 ? "invoice" : "invoices"} will be sent to {customerName}, split by site
          </p>
        </div>
      </div>
    </div>
  );
}
