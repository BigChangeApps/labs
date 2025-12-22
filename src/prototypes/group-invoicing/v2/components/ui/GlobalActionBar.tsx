import { Settings, ChevronDown, Send, CheckCircle, Trash2, FileText } from "lucide-react";
import { Button } from "@/registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/ui/dropdown-menu";
import { formatCurrency } from "../../lib/mock-data";

interface GlobalActionBarProps {
  invoiceCount: number;
  totalAmount: number;
  onOpenSettings: () => void;
  onSendAll: () => void;
  onMarkAsSent?: () => void;
  onSaveAsDraft?: () => void;
  onDeleteAll?: () => void;
  hasSentInvoices?: boolean;
  hideSettingsButton?: boolean;
}

export function GlobalActionBar({
  invoiceCount,
  totalAmount,
  onOpenSettings,
  onSendAll,
  onMarkAsSent,
  onSaveAsDraft,
  onDeleteAll,
  hasSentInvoices = false,
  hideSettingsButton = false,
}: GlobalActionBarProps) {
  // Determine button text based on whether some invoices have been sent
  const buttonText = hasSentInvoices
    ? "Send all remaining invoices"
    : `Send all ${invoiceCount} invoices`;

  return (
    <div className="shrink-0 bg-white border-t border-hw-border px-10 py-6 relative z-[45]">
      <div className="flex items-center justify-between">
        {/* Left - Invoice Settings and Summary */}
        <div className="flex items-center gap-8">
          {/* Invoice Settings Button - hidden when inline settings are shown */}
          {!hideSettingsButton && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenSettings}
              className="gap-1"
            >
              <Settings className="h-4 w-4" />
              Invoice settings
            </Button>
          )}

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

        {/* Right - Send All Split Button with Dropdown */}
        <div className="flex items-stretch rounded-button overflow-hidden shadow-[0_0_0_1px_rgba(7,98,229,0.8)]">
          <Button
            onClick={onSendAll}
            disabled={invoiceCount === 0}
            size="sm"
            className="rounded-r-none"
          >
            {buttonText}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
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
              <DropdownMenuItem onClick={onMarkAsSent} disabled={invoiceCount === 0}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as sent
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSaveAsDraft}>
                <FileText className="h-4 w-4 mr-2" />
                Save as draft
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDeleteAll} 
                disabled={invoiceCount === 0}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
