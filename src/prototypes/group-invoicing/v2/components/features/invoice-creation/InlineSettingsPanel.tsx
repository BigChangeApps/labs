import { useState, useEffect, useMemo } from "react";
import { Check, ChevronDown, AlertTriangle, FileMinus, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/registry/ui/button";
import { Switch } from "@/registry/ui/switch";
import { Checkbox } from "@/registry/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion";
import { cn } from "@/registry/lib/utils";
import { SectionHeader, SettingsRadioGroup, type RadioCardOption } from "../../ui/settings-controls";
import { ApplySettingsConfirmationDialog } from "./ApplySettingsConfirmationDialog";
import type { UniversalSettings, LevelOfDetail } from "../../pages/UnifiedInvoiceWorkspace";

// Level of detail options
const levelOfDetailOptions: RadioCardOption<LevelOfDetail>[] = [
  { 
    id: "summary", 
    label: "Summary",
    description: "One combined total per job",
    icon: <FileMinus className="h-4 w-4" />,
  },
  { 
    id: "partial", 
    label: "Partial",
    description: "Groups by category (Labour, Materials, Other)",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  { 
    id: "detailed", 
    label: "Detailed",
    description: "Every individual line item",
    icon: <FileText className="h-4 w-4" />,
  },
];

interface InlineSettingsPanelProps {
  settings: UniversalSettings;
  onSettingsChange: (settings: UniversalSettings, applyToAll: boolean) => void;
  showApplyToAllCheckbox?: boolean;
  financeOverrideCount?: number;
  onResetFinanceOverrides?: () => void;
  invoiceCount?: number;
}

const bankAccountOptions = [
  { id: "barclays", label: "Barclays 1234" },
  { id: "hsbc", label: "HSBC 5678" },
  { id: "lloyds", label: "Lloyds 9012" },
];

const currencyOptions = [
  { id: "gbp", label: "Great British Pounds (GBP)" },
  { id: "usd", label: "US Dollar (USD)" },
  { id: "eur", label: "Euro (EUR)" },
];

const nominalCodeOptions = [
  { id: "5001", label: "5001" },
  { id: "5002", label: "5002" },
  { id: "5003", label: "5003" },
];

const departmentOptions = [
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
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-hw-text tracking-[-0.12px] leading-4">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full h-9 px-3 py-1 bg-hw-surface rounded-input ring-1 ring-hw-border shadow-input transition-shadow text-left hover:ring-hw-border-hover">
            <span className="text-sm text-hw-text tracking-[-0.14px] leading-5">
              {selected.label}
            </span>
            <ChevronDown className="h-4 w-4 text-hw-text-secondary" />
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
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-hw-surface-subtle transition-colors text-left",
                value === option.id ? "bg-hw-surface-subtle text-hw-brand" : "text-hw-text"
              )}
            >
              <span>{option.label}</span>
              {value === option.id && <Check className="h-4 w-4 text-hw-brand" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SettingsToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <span className="text-sm text-hw-text tracking-[-0.14px] leading-5">
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function InlineSettingsPanel({
  settings,
  onSettingsChange,
  showApplyToAllCheckbox = false,
  financeOverrideCount = 0,
  onResetFinanceOverrides,
  invoiceCount = 1,
}: InlineSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<UniversalSettings>(settings);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Sync with external settings changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Check if settings have changed from the original
  const hasChanges = useMemo(() => {
    return (
      localSettings.levelOfDetail !== settings.levelOfDetail ||
      localSettings.bankAccount !== settings.bankAccount ||
      localSettings.currency !== settings.currency ||
      localSettings.nominalCode !== settings.nominalCode ||
      localSettings.departmentCode !== settings.departmentCode ||
      localSettings.showLogo !== settings.showLogo ||
      localSettings.showTcs !== settings.showTcs ||
      localSettings.customLine !== settings.customLine
    );
  }, [localSettings, settings]);

  const handleApply = () => {
    // If there are changes and feature flag is enabled, show confirmation dialog
    if (hasChanges && showApplyToAllCheckbox && invoiceCount > 1) {
      setConfirmDialogOpen(true);
    } else {
      // Apply directly if no changes or only one invoice
      onSettingsChange(localSettings, true);
      toast.success("Settings applied successfully");
    }
  };

  const handleApplyToAll = () => {
    onSettingsChange(localSettings, true);
    toast.success("Settings applied to all invoices");
  };

  const handleApplyToCurrentOnly = () => {
    onSettingsChange(localSettings, false);
    toast.success("Settings applied to current invoice");
  };

  return (
    <div className="w-[364px] bg-hw-surface border-l border-hw-border flex flex-col h-full overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-6">
          {/* Level of Detail Section */}
          <div>
            <SectionHeader>Invoice Detail</SectionHeader>
            <SettingsRadioGroup
              label="Level of detail"
              options={levelOfDetailOptions}
              value={localSettings.levelOfDetail}
              onChange={(value) =>
                setLocalSettings((prev) => ({ ...prev, levelOfDetail: value }))
              }
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Finance Settings Section */}
          <div>
            <SectionHeader>Finance Settings</SectionHeader>
            <div className="flex flex-col gap-4">
              <SettingsSelect
                label="Bank Account"
                value={localSettings.bankAccount}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, bankAccount: value }))
                }
                options={bankAccountOptions}
              />
              <SettingsSelect
                label="Currency"
                value={localSettings.currency}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, currency: value }))
                }
                options={currencyOptions}
              />
              <SettingsSelect
                label="Default nominal code"
                value={localSettings.nominalCode}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, nominalCode: value }))
                }
                options={nominalCodeOptions}
              />
              <SettingsSelect
                label="Default department"
                value={localSettings.departmentCode}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, departmentCode: value }))
                }
                options={departmentOptions}
              />

              {/* Override count indicator */}
              {financeOverrideCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-amber-800 tracking-[-0.14px] leading-5">
                      {financeOverrideCount} {financeOverrideCount === 1 ? "job has" : "jobs have"} custom settings
                    </span>
                    {onResetFinanceOverrides && (
                      <button
                        onClick={onResetFinanceOverrides}
                        className="text-xs font-medium text-amber-700 hover:text-amber-900 underline text-left transition-colors"
                      >
                        Reset all to defaults
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Display Settings Accordion (collapsed by default) */}
          <Accordion type="single" collapsible className="-mx-8">
            <AccordionItem value="display" className="border-t border-b border-hw-border">
              <AccordionTrigger className="px-8 py-4 text-xs font-medium text-hw-text-secondary uppercase tracking-wide hover:no-underline">
                Display Settings
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-6">
                <div className="flex flex-col gap-2">
                  <SettingsToggle
                    label="Show logo"
                    checked={localSettings.showLogo}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({ ...prev, showLogo: checked }))
                    }
                  />
                  <SettingsToggle
                    label="Show T&Cs"
                    checked={localSettings.showTcs}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({ ...prev, showTcs: checked }))
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Remember Selection */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="inline-remember-selection"
              checked={localSettings.rememberSelection}
              onCheckedChange={(checked) =>
                setLocalSettings((prev) => ({ ...prev, rememberSelection: checked === true }))
              }
              className="mt-0.5"
            />
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="inline-remember-selection"
                className="text-sm font-medium text-hw-text tracking-[-0.14px] leading-5 cursor-pointer"
              >
                Remember selection for this customers
              </label>
              <span className="text-xs text-hw-text-secondary tracking-[-0.12px] leading-4">
                Saves settings for future invoices
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pt-8 pb-8 flex flex-col gap-4 shrink-0 bg-hw-surface">
        <Button variant="secondary" className="w-full" onClick={handleApply}>
          Apply
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ApplySettingsConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        originalSettings={settings}
        newSettings={localSettings}
        invoiceCount={invoiceCount}
        onApplyToAll={handleApplyToAll}
        onApplyToCurrentOnly={handleApplyToCurrentOnly}
      />
    </div>
  );
}
