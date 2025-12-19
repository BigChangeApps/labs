import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/registry/ui/button";
import { Switch } from "@/registry/ui/switch";
import { Checkbox } from "@/registry/ui/checkbox";
import {
  Dialog,
  DialogContent,
} from "@/registry/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/ui/accordion";
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
      <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-between w-full pl-2.5 pr-1.5 py-1.5 bg-white rounded-[6px] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:shadow-[0px_0px_0px_1px_rgba(3,7,18,0.12),0px_0.5px_2px_0px_rgba(11,38,66,0.20)] transition-shadow text-left">
            <span className="text-sm text-[#73777D] tracking-[-0.14px] leading-5">
              {selected.label}
            </span>
            <ChevronDown className="h-5 w-5 text-[#0B2642]" />
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
    <div className="flex items-center justify-between w-full">
      <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function InvoiceSettingsModal({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: InvoiceSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<UniversalSettings>(settings);
  const [levelOfDetailOpen, setLevelOfDetailOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
    toast.success("Settings applied successfully");
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onOpenChange(false);
  };

  const levelOfDetailLabel = levelOfDetailOptions.find(
    (opt) => opt.id === localSettings.levelOfDetail
  )?.label || "Partial";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[439px] p-0 gap-0 !rounded-lg overflow-hidden ring-0 shadow-[0px_0px_0px_1px_rgba(11,38,66,0.08),0px_16px_32px_0px_rgba(11,38,66,0.08),0px_2px_24px_0px_rgba(11,38,66,0.08)]">
        {/* Header with grey background and rounded top corners */}
        <div className="bg-[#F8F9FC] px-5 py-4 rounded-t-lg">
          <h2 className="text-base font-bold text-[#0B2642] tracking-[-0.16px] leading-6">
            Group Invoice Settings
          </h2>
        </div>

        {/* Accordion Sections */}
        <div className="flex flex-col">
          <Accordion type="multiple" defaultValue={[]} className="w-full">
            {/* Breakdown settings */}
            <AccordionItem value="breakdown" className="border-b border-[#E5E5E5] px-4">
              <AccordionTrigger className="text-sm font-medium text-[#0A0A0A] hover:no-underline py-4">
                Breakdown settings
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-6">
                <div className="flex flex-col gap-6">
                  {/* Level of Detail */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5">
                      Level of detail (for all invoices)
                    </span>
                    <Popover open={levelOfDetailOpen} onOpenChange={setLevelOfDetailOpen}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center justify-between w-full pl-2.5 pr-1.5 py-1.5 bg-white rounded-[6px] shadow-[0px_0px_0px_1px_rgba(3,7,18,0.08),0px_0.5px_2px_0px_rgba(11,38,66,0.16)] hover:shadow-[0px_0px_0px_1px_rgba(3,7,18,0.12),0px_0.5px_2px_0px_rgba(11,38,66,0.20)] transition-shadow text-left">
                          <span className="text-sm text-[#73777D] tracking-[-0.14px] leading-5">
                            {levelOfDetailLabel}
                          </span>
                          <ChevronDown className="h-5 w-5 text-[#0B2642]" />
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

                  {/* Contact Level */}
                  <SettingsSelect
                    label="Contact Level"
                    value={localSettings.contactLevel}
                    onChange={(value) =>
                      setLocalSettings((prev) => ({ ...prev, contactLevel: value }))
                    }
                    options={contactLevelOptions}
                  />

                  {/* Custom Line */}
                  <SettingsToggle
                    label="Add custom line"
                    checked={localSettings.customLine}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({ ...prev, customLine: checked }))
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Finance settings */}
            <AccordionItem value="finance" className="border-b border-[#E5E5E5] px-4">
              <AccordionTrigger className="text-sm font-medium text-[#0A0A0A] hover:no-underline py-4">
                Finance settings
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-6">
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
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Display settings - moved to bottom */}
            <AccordionItem value="display" className="border-b border-[#E5E5E5] px-4">
              <AccordionTrigger className="text-sm font-medium text-[#0A0A0A] hover:no-underline py-4">
                Display settings
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-6">
                <div className="flex flex-col gap-4">
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

          {/* Remember Selection Checkbox */}
          <div className="px-6 py-4">
            <div className="flex items-start gap-2">
              <Checkbox
                id="remember-selection"
                checked={localSettings.rememberSelection}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, rememberSelection: checked === true }))
                }
                className="mt-0.5"
              />
              <div className="flex flex-col">
                <label
                  htmlFor="remember-selection"
                  className="text-sm font-medium text-[#0B2642] tracking-[-0.14px] leading-5 cursor-pointer"
                >
                  Remember selection for this customer
                </label>
                <span className="text-sm text-[#73777D] tracking-[-0.14px] leading-5">
                  This will save settings for future invoice creations
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with grey background and rounded bottom corners */}
        <div className="bg-[#F8F9FC] px-4 py-4 flex items-center justify-end gap-3 rounded-b-lg">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply settings</Button>
        </div>

        {/* Inner shadow overlay for subtle border effect */}
        <div className="absolute inset-0 pointer-events-none rounded-lg shadow-[inset_0px_0px_0px_1px_white,inset_0px_0px_0px_2px_rgba(229,231,235,0.4)]" />
      </DialogContent>
    </Dialog>
  );
}
