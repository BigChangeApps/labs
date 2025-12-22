import { Settings, ChevronDown } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { formatCurrency } from "../../lib/mock-data";

interface GlobalActionBarProps {
  invoiceCount: number;
  totalAmount: number;
  onOpenSettings: () => void;
  onSendAll: () => void;
  hasSentInvoices?: boolean;
}

export function GlobalActionBar({
  invoiceCount,
  totalAmount,
  onOpenSettings,
  onSendAll,
  hasSentInvoices = false,
}: GlobalActionBarProps) {
  // Determine button text based on whether some invoices have been sent
  const buttonText = hasSentInvoices
    ? "Send all remaining invoices"
    : `Send all ${invoiceCount} invoices`;

  return (
    <div className="shrink-0 bg-white border-t border-hw-border px-10 py-6">
      <div className="flex items-center justify-between">
        {/* Left - Invoice Settings and Summary */}
        <div className="flex items-center gap-8">
          {/* Invoice Settings Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSettings}
            className="gap-1"
          >
            <Settings className="h-4 w-4" />
            Invoice settings
          </Button>

          {/* Summary with mixed typography */}
          <p className="text-sm font-medium text-hw-text tracking-[-0.14px]">
            <span>{invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}</span>
            <span className="text-xs tracking-[-0.12px]"> | </span>
            <span>Total: </span>
            <span className="text-base font-bold tracking-[-0.16px]">
              {formatCurrency(totalAmount)}
            </span>
          </p>
        </div>

        {/* Right - Send All Split Button */}
        <div className="flex items-stretch rounded-button overflow-hidden shadow-[0_0_0_1px_rgba(7,98,229,0.8)]">
          <Button
            onClick={onSendAll}
            disabled={invoiceCount === 0}
            size="sm"
            className="rounded-r-none"
          >
            {buttonText}
          </Button>
          <Button
            size="sm"
            className="rounded-l-none border-l border-white/20 px-1"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
