import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Switch } from "@/registry/ui/switch";
import { Checkbox } from "@/registry/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/registry/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { cn } from "@/registry/lib/utils";
import type { UniversalSettings, LevelOfDetail } from "./UnifiedInvoiceWorkspace";

interface InvoiceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: UniversalSettings;
  onSettingsChange: (settings: UniversalSettings) => void;
}

const levelOfDetailOptions: { id: LevelOfDetail; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "partial", label: "Partial" },
  { id: "detailed", label: "Detailed" },
];

const currencyOptions = [
  { id: "gbp", label: "Great British Pounds (GBP)" },
  { id: "usd", label: "US Dollar (USD)" },
  { id: "eur", label: "Euro (EUR)" },
];

const bankAccountOptions = [
  { id: "barclays", label: "Barclays 1234" },
  { id: "hsbc", label: "HSBC 5678" },
  { id: "lloyds", label: "Lloyds 9012" },
];

const nominalCodeOptions = [
  { id: "5001", label: "5001" },
  { id: "5002", label: "5002" },
  { id: "5003", label: "5003" },
];

const departmentCodeOptions = [
  { id: "HS49301", label: "HS/49301" },
  { id: "HS49302", label: "HS/49302" },
  { id: "HS49303", label: "HS/49303" },
];

const contactLevelOptions = [
  { id: "HS49301", label: "HS/49301" },
  { id: "HS49302", label: "HS/49302" },
  { id: "HS49303", label: "HS/49303" },
];

function SettingsSelect({
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
  const selected = options.find((o) => o.id === value) || options[0];

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full px-3 py-2 bg-white rounded-md border border-[rgba(26,28,46,0.12)] hover:border-[rgba(26,28,46,0.24)] transition-colors text-left">
            <span className="text-sm text-[#0B2642] tracking-[-0.14px]">
              {selected.label}
            </span>
            <ChevronDown className="h-4 w-4 text-[#73777D]" />
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
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-[#F8F9FC] transition-colors text-left",
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

export function InvoiceSettingsModal({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: InvoiceSettingsModalProps) {
  // Local state for editing
  const [localSettings, setLocalSettings] = useState<UniversalSettings>(settings);

  // Sync with props when modal opens
  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onOpenChange(false);
  };

  // Get level of detail display label
  const levelOfDetailLabel = levelOfDetailOptions.find(
    (opt) => opt.id === localSettings.levelOfDetail
  )?.label || "Partial";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[rgba(26,28,46,0.08)]">
          <DialogTitle className="text-lg font-bold text-[#0B2642] tracking-[-0.18px]">
            Group Invoice Settings
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6 max-h-[60vh] overflow-auto">
          {/* Level of Detail - Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
                Level of detail
              </span>
              <span className="text-sm text-[#73777D]">(for all invoices)</span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center justify-between w-full px-3 py-2 bg-white rounded-md border border-[rgba(26,28,46,0.12)] hover:border-[rgba(26,28,46,0.24)] transition-colors text-left">
                  <span className="text-sm text-[#0B2642] tracking-[-0.14px]">
                    {levelOfDetailLabel}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#73777D]" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
                {levelOfDetailOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        levelOfDetail: option.id,
                      }))
                    }
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-[#F8F9FC] transition-colors text-left",
                      localSettings.levelOfDetail === option.id ? "bg-[#F8F9FC] text-[#086DFF]" : "text-[#0B2642]"
                    )}
                  >
                    <span>{option.label}</span>
                    {localSettings.levelOfDetail === option.id && <Check className="h-4 w-4 text-[#086DFF]" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {/* Contact Level - moved to top section */}
          <SettingsSelect
            label="Contact Level"
            value={localSettings.contactLevel}
            onChange={(value) =>
              setLocalSettings((prev) => ({ ...prev, contactLevel: value }))
            }
            options={contactLevelOptions}
          />

          {/* Bank Account */}
          <SettingsSelect
            label="Bank Account"
            value={localSettings.bankAccount}
            onChange={(value) =>
              setLocalSettings((prev) => ({ ...prev, bankAccount: value }))
            }
            options={bankAccountOptions}
          />

          {/* Currency */}
          <SettingsSelect
            label="Currency"
            value={localSettings.currency}
            onChange={(value) =>
              setLocalSettings((prev) => ({ ...prev, currency: value }))
            }
            options={currencyOptions}
          />

          {/* Default Nominal Code */}
          <SettingsSelect
            label="Default nominal code"
            value={localSettings.nominalCode}
            onChange={(value) =>
              setLocalSettings((prev) => ({ ...prev, nominalCode: value }))
            }
            options={nominalCodeOptions}
          />

          {/* Default Department */}
          <SettingsSelect
            label="Default department"
            value={localSettings.departmentCode}
            onChange={(value) =>
              setLocalSettings((prev) => ({ ...prev, departmentCode: value }))
            }
            options={departmentCodeOptions}
          />

          {/* Divider */}
          <div className="h-px bg-[rgba(26,28,46,0.08)]" />

          {/* T&Cs Text Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px]">
              Add T&Cs text
            </span>
            <Switch
              checked={localSettings.tcsTextEnabled}
              onCheckedChange={(checked) =>
                setLocalSettings((prev) => ({ ...prev, tcsTextEnabled: checked }))
              }
            />
          </div>

          {/* Remember Selection Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-selection"
              checked={localSettings.rememberSelection}
              onCheckedChange={(checked) =>
                setLocalSettings((prev) => ({ ...prev, rememberSelection: checked === true }))
              }
            />
            <label
              htmlFor="remember-selection"
              className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] cursor-pointer"
            >
              Remember selection for customer
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(26,28,46,0.08)] flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
