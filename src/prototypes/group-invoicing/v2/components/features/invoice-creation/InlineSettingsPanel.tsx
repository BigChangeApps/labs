import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/registry/ui/button";
import { Switch } from "@/registry/ui/switch";
import { Checkbox } from "@/registry/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";
import { cn } from "@/registry/lib/utils";
import type { UniversalSettings, LevelOfDetail } from "../../pages/UnifiedInvoiceWorkspace";

interface InlineSettingsPanelProps {
  settings: UniversalSettings;
  onSettingsChange: (settings: UniversalSettings, applyToAll: boolean) => void;
  showApplyToAllCheckbox?: boolean;
}

const levelOfDetailOptions: { id: LevelOfDetail; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "partial", label: "Partial" },
  { id: "detailed", label: "Detailed" },
];

const contactLevelOptions = [
  { id: "contact", label: "Contact (1 invoice)" },
  { id: "site", label: "Site (per site)" },
];

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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium text-hw-text-secondary uppercase tracking-wide mb-3">
      {children}
    </h3>
  );
}

export function InlineSettingsPanel({
  settings,
  onSettingsChange,
  showApplyToAllCheckbox = false,
}: InlineSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<UniversalSettings>(settings);
  const [levelOfDetailOpen, setLevelOfDetailOpen] = useState(false);
  const [applyToAll, setApplyToAll] = useState(true);

  // Sync with external settings changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleApply = () => {
    onSettingsChange(localSettings, showApplyToAllCheckbox ? applyToAll : true);
    toast.success(
      showApplyToAllCheckbox && !applyToAll 
        ? "Settings applied to current invoice" 
        : "Settings applied successfully"
    );
  };

  const levelOfDetailLabel = levelOfDetailOptions.find(
    (opt) => opt.id === localSettings.levelOfDetail
  )?.label || "Partial";

  return (
    <div className="w-[380px] bg-hw-surface border-l border-hw-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-hw-border shrink-0">
        <h2 className="text-sm font-semibold text-hw-text tracking-[-0.14px] leading-5">
          Invoice Settings
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-6">
          {/* Breakdown Section */}
          <div>
            <SectionHeader>Breakdown</SectionHeader>
            <div className="flex flex-col gap-4">
              {/* Level of Detail */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-hw-text tracking-[-0.12px] leading-4">
                  Level of detail
                </span>
                <Popover open={levelOfDetailOpen} onOpenChange={setLevelOfDetailOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center justify-between w-full h-9 px-3 py-1 bg-hw-surface rounded-input ring-1 ring-hw-border shadow-input transition-shadow text-left hover:ring-hw-border-hover">
                      <span className="text-sm text-hw-text tracking-[-0.14px] leading-5">
                        {levelOfDetailLabel}
                      </span>
                      <ChevronDown className="h-4 w-4 text-hw-text-secondary" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
                    {levelOfDetailOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setLocalSettings((prev) => ({
                            ...prev,
                            levelOfDetail: option.id,
                          }));
                          setLevelOfDetailOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-hw-surface-subtle transition-colors text-left",
                          localSettings.levelOfDetail === option.id ? "bg-hw-surface-subtle text-hw-brand" : "text-hw-text"
                        )}
                      >
                        <span>{option.label}</span>
                        {localSettings.levelOfDetail === option.id && <Check className="h-4 w-4 text-hw-brand" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              <SettingsSelect
                label="Contact level"
                value={localSettings.contactLevel}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, contactLevel: value }))
                }
                options={contactLevelOptions}
              />

              <SettingsToggle
                label="Add custom line"
                checked={localSettings.customLine}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, customLine: checked }))
                }
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-hw-border" />

          {/* Finance Section */}
          <div>
            <SectionHeader>Finance</SectionHeader>
            <div className="flex flex-col gap-4">
              <SettingsSelect
                label="Bank account"
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
                label="Nominal code"
                value={localSettings.nominalCode}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, nominalCode: value }))
                }
                options={nominalCodeOptions}
              />
              <SettingsSelect
                label="Department"
                value={localSettings.departmentCode}
                onChange={(value) =>
                  setLocalSettings((prev) => ({ ...prev, departmentCode: value }))
                }
                options={departmentOptions}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-hw-border" />

          {/* Display Section */}
          <div>
            <SectionHeader>Display</SectionHeader>
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
          </div>

          {/* Divider */}
          <div className="h-px bg-hw-border" />

          {/* Remember Selection */}
          <div className="flex items-start gap-2.5">
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
                className="text-sm text-hw-text tracking-[-0.14px] leading-5 cursor-pointer"
              >
                Remember selection
              </label>
              <span className="text-xs text-hw-text-secondary tracking-[-0.12px] leading-4">
                Save for future invoices
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-hw-border shrink-0 bg-hw-surface">
        {showApplyToAllCheckbox ? (
          <div className="flex items-center gap-2">
            <Checkbox
              id="inline-apply-to-all"
              checked={applyToAll}
              onCheckedChange={(checked) => setApplyToAll(checked === true)}
            />
            <label
              htmlFor="inline-apply-to-all"
              className="text-sm text-hw-text tracking-[-0.14px] leading-5 cursor-pointer"
            >
              Apply to all
            </label>
          </div>
        ) : (
          <div />
        )}
        <Button variant="secondary" size="sm" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
