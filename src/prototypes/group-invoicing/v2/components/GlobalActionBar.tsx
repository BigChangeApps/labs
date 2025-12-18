import { Settings, ChevronDown } from "lucide-react";
import { formatCurrency } from "../lib/mock-data";

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

  // #region agent log
  const containerClassName = "shrink-0 bg-white border-t border-[rgba(26,28,46,0.12)] px-10 py-6";
  fetch('http://127.0.0.1:7242/ingest/cf7df69f-f856-4874-ac6a-b53ffb85f438',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GlobalActionBar.tsx:25',message:'GlobalActionBar RENDER',data:{containerClassName,invoiceCount,hasSentInvoices,buildTime:Date.now()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1-H3'})}).catch(()=>{});
  // #endregion

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between">
        {/* Left - Invoice Settings and Summary */}
        <div className="flex items-center gap-8">
          {/* Invoice Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 h-8 px-1 py-1.5 rounded-md bg-white shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08)] hover:shadow-[0px_0px_0px_1px_rgba(11,38,66,0.16)] transition-shadow"
          >
            <Settings className="h-4 w-4 text-[#0A0A0A]" />
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] px-0.5">
              Invoice settings
            </span>
          </button>

          {/* Summary with mixed typography */}
          <p className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
            <span>{invoiceCount} invoice{invoiceCount !== 1 ? "s" : ""}</span>
            <span className="text-xs tracking-[-0.12px]"> | </span>
            <span>Total: </span>
            <span className="text-base font-bold tracking-[-0.16px]">
              {formatCurrency(totalAmount)}
            </span>
          </p>
        </div>

        {/* Right - Send All Split Button */}
        <div className="flex items-stretch h-[34px] rounded-md shadow-[0_0_0_1px_rgba(7,98,229,0.8)] overflow-hidden">
          <button
            onClick={onSendAll}
            disabled={invoiceCount === 0}
            className="flex items-center px-1 py-1.5 bg-[#086DFF] hover:bg-[#0752cc] text-white text-sm font-medium tracking-[-0.14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="px-0.5">{buttonText}</span>
          </button>
          <button className="flex items-center justify-center px-0 py-1.5 bg-[#086DFF] hover:bg-[#0752cc] border-l border-[#E5E5E5] transition-colors">
            <ChevronDown className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
